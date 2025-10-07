import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import supabaseVideoCallService from "../services/supabaseVideoCallService";

export const useSupabaseVideoCallStore = create((set, get) => ({
  // Estado de la llamada
  currentCallId: null,
  isCallActive: false,
  isIncomingCall: false,
  isOutgoingCall: false,
  callType: null, // 'video' | 'audio'
  caller: null,
  receiver: null,
  
  // Estado WebRTC
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isConnected: false,
  
  // Estado de controles
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,
  
  // Estado de pantalla compartida
  screenStream: null,
  availableScreens: [],
  
  // Usuario remoto en la llamada
  remoteUser: null,
  
  // Configuración STUN/TURN
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],

  // Inicializar el servicio con callbacks
  initializeService: async () => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      console.error('❌ Usuario no autenticado');
      return;
    }

    await supabaseVideoCallService.initialize(authUser.id, {
      // Callback para llamadas entrantes
      onIncomingCall: (data) => {
        console.log('📞 Llamada entrante recibida en store:', data);
        set({
          isIncomingCall: true,
          currentCallId: data.callId,
          caller: data.caller,
          callType: data.callType
        });
      },
      
      // Callback para señales WebRTC
      onSignalReceived: async (signal) => {
        console.log('🧊 Señal WebRTC recibida en store:', signal.type);
        await get().handleIncomingSignal(signal);
      },
      
      // Callback para cambios de estado
      onCallStatusChanged: (call) => {
        console.log('📞 Estado de llamada cambiado:', call.status);
        
        if (call.status === 'rejected') {
          console.log('❌ Llamada rechazada');
          get().resetCallState();
        } else if (call.status === 'ended') {
          console.log('📞 Llamada finalizada');
          get().cleanupStreams();
          get().resetCallState();
        } else if (call.status === 'connected') {
          console.log('✅ Llamada conectada');
          set({ isConnected: true });
        }
      }
    });

    console.log('✅ Servicio de videollamadas con Supabase inicializado');
  },

  // Manejar señales entrantes
  handleIncomingSignal: async (signal) => {
    const { peerConnection } = get();
    
    switch (signal.type) {
      case 'offer':
        await get().handleIncomingOffer(signal);
        break;
        
      case 'answer':
        if (peerConnection) {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(signal.data)
          );
        }
        break;
        
      case 'ice-candidate':
        if (peerConnection && signal.data) {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(signal.data)
          );
        }
        break;
        
      case 'renegotiation':
        await get().handleRenegotiation(signal);
        break;
        
      default:
        console.warn('⚠️ Tipo de señal desconocido:', signal.type);
    }
  },

  // Manejar oferta entrante
  handleIncomingOffer: async (signal) => {
    console.log('📞 Manejando oferta entrante');
    
    const { peerConnection } = get();
    if (peerConnection) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(signal.data)
      );
      
      // Crear y enviar respuesta
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // Obtener ID del usuario remoto
      const remoteUserId = get().caller?._id;
      if (remoteUserId) {
        await supabaseVideoCallService.sendSignal(
          remoteUserId,
          'answer',
          answer,
          signal.callId
        );
      }
    }
  },

  // Manejar renegociación
  handleRenegotiation: async (signal) => {
    console.log('🔄 Manejando renegociación');
    
    const { peerConnection } = get();
    if (peerConnection && signal.data) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(signal.data)
      );
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      const remoteUserId = get().remoteUser?._id;
      if (remoteUserId) {
        await supabaseVideoCallService.sendSignal(
          remoteUserId,
          'answer',
          answer
        );
      }
    }
  },

  // Inicializar llamada saliente
  initiateCall: async (receiverUser, callType = 'video') => {
    console.log('🔄 Iniciando llamada a:', receiverUser.fullName);
    
    const authUser = useAuthStore.getState().authUser;
    
    if (!authUser) {
      console.error('❌ Usuario no autenticado');
      return;
    }

    try {
      // Crear la llamada en Supabase
      const callId = await supabaseVideoCallService.startCall(
        receiverUser.id,
        callType
      );
      
      if (!callId) {
        console.error('❌ No se pudo crear la llamada');
        return;
      }
      
      // Configurar estado inicial
      set({
        currentCallId: callId,
        isCallActive: true,
        isOutgoingCall: true,
        callType,
        caller: authUser,
        receiver: receiverUser,
        remoteUser: receiverUser,
        isConnected: false
      });

      // Obtener stream local
      const stream = await get().getLocalStream(callType === 'video');
      set({ localStream: stream });

      // Crear peer connection
      const pc = get().createPeerConnection();
      set({ peerConnection: pc });

      // Agregar tracks al peer connection
      if (stream && stream.getTracks().length > 0) {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      }

      // Crear oferta
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Enviar oferta a través de Supabase
      await supabaseVideoCallService.sendSignal(
        receiverUser.id,
        'offer',
        offer,
        callId
      );
      
      console.log('📞 Oferta enviada exitosamente');

    } catch (error) {
      console.error('❌ Error iniciando llamada:', error);
      get().endCall();
    }
  },

  // Aceptar llamada entrante
  acceptCall: async () => {
    console.log('✅ Aceptando llamada');
    
    const { currentCallId, caller } = get();
    const authUser = useAuthStore.getState().authUser;
    
    if (!currentCallId || !caller) {
      console.error('❌ No hay llamada entrante para aceptar');
      return;
    }

    try {
      // Aceptar la llamada en Supabase
      const accepted = await supabaseVideoCallService.acceptCall(currentCallId);
      
      if (!accepted) {
        console.error('❌ No se pudo aceptar la llamada');
        return;
      }
      
      // Configurar estado
      set({
        isCallActive: true,
        isIncomingCall: false,
        isOutgoingCall: false,
        receiver: authUser,
        remoteUser: caller
      });

      // Obtener stream local
      const stream = await get().getLocalStream(get().callType === 'video');
      set({ localStream: stream });

      // Crear peer connection
      const pc = get().createPeerConnection();
      set({ peerConnection: pc });

      // Agregar tracks
      if (stream && stream.getTracks().length > 0) {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      }

      // Procesar señales pendientes (como la oferta)
      const pendingSignals = await supabaseVideoCallService.getPendingSignals();
      for (const signal of pendingSignals) {
        await get().handleIncomingSignal({
          type: signal.signal_type,
          data: signal.signal_data,
          callId: signal.call_id,
          fromUserId: signal.from_user_id
        });
      }

    } catch (error) {
      console.error('❌ Error aceptando llamada:', error);
      get().rejectCall();
    }
  },

  // Rechazar llamada
  rejectCall: async () => {
    console.log('❌ Rechazando llamada');
    
    const { currentCallId } = get();
    
    if (currentCallId) {
      await supabaseVideoCallService.rejectCall(currentCallId);
    }

    get().resetCallState();
  },

  // Finalizar llamada
  endCall: async () => {
    console.log('📞 Finalizando llamada');
    
    const { currentCallId, peerConnection } = get();

    // Notificar a Supabase
    if (currentCallId) {
      await supabaseVideoCallService.endCall(currentCallId);
    }

    // Limpiar conexión
    if (peerConnection) {
      peerConnection.close();
    }

    get().cleanupStreams();
    get().resetCallState();
  },

  // Obtener stream local
  getLocalStream: async (includeVideo = true, includeAudio = true) => {
    try {
      console.log('📹 Obteniendo stream local');
      
      const constraints = {
        audio: includeAudio,
        video: includeVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      // En Electron, necesitamos manejar los permisos de manera especial
      if (window.electronAPI) {
        // Solicitar permisos a través del proceso principal
        const hasPermission = await window.electronAPI.requestMediaPermission();
        if (!hasPermission) {
          console.error('❌ Permisos de cámara/micrófono denegados');
          return new MediaStream();
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('📹 Stream obtenido:', stream.getTracks().length, 'tracks');
      return stream;
      
    } catch (error) {
      console.error('❌ Error obteniendo stream:', error);
      
      // Crear stream vacío como fallback
      return new MediaStream();
    }
  },

  // Crear peer connection
  createPeerConnection: () => {
    const { iceServers, currentCallId, remoteUser } = get();
    
    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10
    });

    // Manejar candidatos ICE
    pc.onicecandidate = async (event) => {
      if (event.candidate && remoteUser && currentCallId) {
        console.log('🧊 Enviando candidato ICE');
        await supabaseVideoCallService.sendSignal(
          remoteUser._id,
          'ice-candidate',
          event.candidate,
          currentCallId
        );
      }
    };

    // Manejar estado de conexión
    pc.onconnectionstatechange = async () => {
      console.log('🔗 Estado de conexión:', pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        set({ isConnected: true });
        // Actualizar estado en Supabase
        if (currentCallId) {
          await supabaseVideoCallService.updateCallStatus(currentCallId, 'connected');
        }
      } else if (pc.connectionState === 'failed') {
        set({ isConnected: false });
        get().endCall();
      }
    };

    // Manejar stream remoto
    pc.ontrack = (event) => {
      console.log('📹 Stream remoto recibido');
      const [stream] = event.streams;
      set({ remoteStream: stream });
    };

    return pc;
  },

  // Alternar video
  toggleVideo: () => {
    const { localStream, isVideoEnabled } = get();
    
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        set({ isVideoEnabled: !isVideoEnabled });
      }
    }
  },

  // Alternar audio
  toggleAudio: () => {
    const { localStream, isAudioEnabled } = get();
    
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        set({ isAudioEnabled: !isAudioEnabled });
      }
    }
  },

  // Iniciar compartir pantalla
  startScreenShare: async () => {
    try {
      let screenStream;
      
      if (window.electronAPI) {
        // En Electron, obtener fuentes de pantalla
        const sources = await window.electronAPI.getDesktopSources();
        if (sources.length === 0) {
          console.error('❌ No hay fuentes de pantalla disponibles');
          return;
        }
        
        // Por simplicidad, usar la primera fuente (pantalla completa)
        const source = sources[0];
        
        screenStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              minWidth: 1280,
              maxWidth: 1920,
              minHeight: 720,
              maxHeight: 1080
            }
          }
        });
      } else {
        // En navegadores, usar getDisplayMedia
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: false
        });
      }

      const { peerConnection, currentCallId, remoteUser } = get();
      
      if (peerConnection && screenStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );

        if (sender) {
          await sender.replaceTrack(videoTrack);
        } else {
          peerConnection.addTrack(videoTrack, screenStream);
          
          // Renegociar
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          if (remoteUser && currentCallId) {
            await supabaseVideoCallService.sendSignal(
              remoteUser._id,
              'renegotiation',
              offer,
              currentCallId
            );
          }
        }

        // Manejar cuando se deja de compartir
        videoTrack.onended = () => {
          get().stopScreenShare();
        };

        set({ 
          screenStream, 
          isScreenSharing: true 
        });

        console.log('🖥️ Compartir pantalla iniciado');
      }
    } catch (error) {
      console.error('❌ Error compartiendo pantalla:', error);
    }
  },

  // Detener compartir pantalla
  stopScreenShare: async () => {
    const { screenStream, peerConnection, localStream } = get();

    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection && localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
    }

    set({ 
      screenStream: null, 
      isScreenSharing: false 
    });

    console.log('🖥️ Compartir pantalla detenido');
  },

  // Limpiar streams
  cleanupStreams: () => {
    const { localStream, screenStream } = get();

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }

    set({
      localStream: null,
      remoteStream: null,
      screenStream: null
    });
  },

  // Resetear estado
  resetCallState: () => {
    set({
      currentCallId: null,
      isCallActive: false,
      isIncomingCall: false,
      isOutgoingCall: false,
      callType: null,
      caller: null,
      receiver: null,
      remoteUser: null,
      peerConnection: null,
      isConnected: false,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      availableScreens: []
    });
  }
}));
