import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useVideoCallStore = create((set, get) => ({
  // Estado de la llamada
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
  
  // Oferta pendiente para llamadas entrantes
  pendingOffer: null,
  
  // Configuración STUN/TURN
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],

  // Inicializar llamada saliente
  initiateCall: async (receiverUser, callType = 'video', settings = null) => {
    console.log('🔄 Iniciando llamada a:', receiverUser.fullName);
    console.log('🔄 Tipo de llamada:', callType);
    console.log('🔄 Receptor ID:', receiverUser._id);
    console.log('🔄 Configuración:', settings);
    
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    
    if (!socket || !authUser) {
      console.error('❌ Socket o usuario no disponible');
      console.error('❌ Socket:', !!socket, 'AuthUser:', !!authUser);
      return;
    }

    console.log('✅ Socket y usuario disponibles, continuando...');

    try {
      // Configurar estado inicial
      set({
        isCallActive: true,
        isOutgoingCall: true,
        callType,
        caller: authUser,
        receiver: receiverUser,
        remoteUser: receiverUser, // Guardar usuario remoto
        isConnected: false
      });

      console.log('🔄 Estado inicial configurado');

      // Primero enviar la oferta básica sin WebRTC para que aparezca el modal
      const basicOfferData = {
        to: receiverUser._id,
        offer: { type: 'offer', sdp: 'basic-offer' }, // Oferta básica temporal
        callType,
        caller: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      };
      
      console.log('📞 Enviando oferta básica de llamada:', basicOfferData);
      console.log('📞 Socket conectado:', socket.connected);
      console.log('📞 Socket ID:', socket.id);
      
      socket.emit('video-call-offer', basicOfferData);
      console.log('📞 Oferta básica enviada al servidor');

      // Luego configurar WebRTC en segundo plano
      try {
        console.log('🔄 Configurando WebRTC...');
        
        // Obtener stream local (con manejo de errores)
        let stream;
        try {
          // Usar configuración específica si está disponible
          const useVideo = settings ? settings.video : (callType === 'video');
          const useAudio = settings ? settings.audio : true;
          
          stream = await get().getLocalStream(useVideo, useAudio);
          set({ localStream: stream });
          console.log('📹 Stream local obtenido con configuración:', { video: useVideo, audio: useAudio });
        } catch (streamError) {
          console.warn('⚠️ Problema obteniendo stream, continuando sin media:', streamError);
          stream = new MediaStream();
          set({ localStream: stream });
        }

        // Crear peer connection
        const pc = get().createPeerConnection();
        set({ peerConnection: pc });
        console.log('🔗 Peer connection creado');

        // Agregar tracks al peer connection (solo si existen)
        if (stream && stream.getTracks().length > 0) {
          stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
          });
          console.log('📹 Tracks agregados al peer connection:', stream.getTracks().length);
        } else {
          console.log('⚠️ No hay tracks para agregar, creando track dummy para ICE');
          
          // Crear un track de audio silencioso para forzar la generación de candidatos ICE
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const destination = audioContext.createMediaStreamDestination();
            oscillator.connect(destination);
            oscillator.frequency.setValueAtTime(0, audioContext.currentTime); // Silencioso
            oscillator.start();
            
            const dummyStream = destination.stream;
            dummyStream.getTracks().forEach(track => {
              console.log('🔇 Agregando track dummy para ICE:', track.kind);
              pc.addTrack(track, dummyStream);
            });
          } catch (error) {
            console.warn('⚠️ No se pudo crear track dummy:', error.message);
          }
        }

        // Crear oferta real
        const realOffer = await pc.createOffer();
        await pc.setLocalDescription(realOffer);
        console.log('📞 Oferta WebRTC real creada');

        // Actualizar con la oferta real (esto se enviará cuando el otro usuario acepte)
        set({ pendingOffer: realOffer });

      } catch (webrtcError) {
        console.error('❌ Error configurando WebRTC (pero la llamada básica ya se envió):', webrtcError);
        // No cancelar la llamada, solo log del error
      }

    } catch (error) {
      console.error('❌ Error iniciando llamada:', error);
      get().endCall();
    }
  },

  // Aceptar llamada entrante
  acceptCall: async (offer, caller) => {
    console.log('✅ Aceptando llamada de:', caller.fullName);
    console.log('✅ Oferta recibida:', offer);
    
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    try {
      // Configurar estado
      set({
        isCallActive: true,
        isIncomingCall: false,
        isOutgoingCall: false,
        caller,
        receiver: authUser,
        remoteUser: caller, // Guardar usuario remoto
        callType: get().callType || 'video'
      });

      console.log('✅ Estado configurado para aceptar llamada');

      // Obtener stream local (con manejo de errores mejorado)
      console.log('📹 Obteniendo stream local...');
      let stream;
      try {
        stream = await get().getLocalStream(get().callType === 'video');
        set({ localStream: stream });
        console.log('📹 Stream local obtenido exitosamente');
      } catch (streamError) {
        console.warn('⚠️ Problema con stream local, continuando sin media:', streamError);
        // Crear stream vacío para continuar
        stream = new MediaStream();
        set({ localStream: stream });
      }

      // Crear peer connection
      console.log('🔗 Creando peer connection...');
      const pc = get().createPeerConnection();
      set({ peerConnection: pc });

      // Agregar tracks del stream local al peer connection
      if (stream && stream.getTracks().length > 0) {
        stream.getTracks().forEach(track => {
          console.log('📹 Agregando track:', track.kind);
          pc.addTrack(track, stream);
        });
      } else {
        console.log('⚠️ No hay tracks para agregar, creando track dummy para ICE');
        
        // Crear un track de audio silencioso para forzar la generación de candidatos ICE
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const destination = audioContext.createMediaStreamDestination();
          oscillator.connect(destination);
          oscillator.frequency.setValueAtTime(0, audioContext.currentTime); // Silencioso
          oscillator.start();
          
          const dummyStream = destination.stream;
          dummyStream.getTracks().forEach(track => {
            console.log('🔇 Agregando track dummy para ICE:', track.kind);
            pc.addTrack(track, dummyStream);
          });
        } catch (error) {
          console.warn('⚠️ No se pudo crear track dummy:', error.message);
        }
      }

      // Solicitar la oferta WebRTC real
      console.log('⚠️ Oferta básica recibida, enviando solicitud de oferta real...');
      socket.emit('video-call-request-real-offer', {
        to: caller._id
      });

    } catch (error) {
      console.error('❌ Error aceptando llamada:', error);
      get().rejectCall();
    }
  },

  // Rechazar llamada
  rejectCall: () => {
    console.log('❌ Rechazando llamada');
    
    const socket = useAuthStore.getState().socket;
    const { caller } = get();

    if (caller && socket) {
      socket.emit('video-call-rejected', {
        to: caller._id
      });
    }

    get().resetCallState();
  },

  // Finalizar llamada
  endCall: () => {
    console.log('📞 Finalizando llamada');
    
    const socket = useAuthStore.getState().socket;
    const { caller, receiver, peerConnection } = get();

    // Notificar al otro usuario
    if (socket) {
      const otherUserId = caller?._id === useAuthStore.getState().authUser?._id 
        ? receiver?._id 
        : caller?._id;
      
      if (otherUserId) {
        socket.emit('video-call-ended', {
          to: otherUserId
        });
      }
    }

    // Limpiar conexión
    if (peerConnection) {
      peerConnection.close();
    }

    get().cleanupStreams();
    get().resetCallState();
  },

  // Obtener stream local (cámara/micrófono)
  getLocalStream: async (includeVideo = true, includeAudio = true) => {
    try {
      console.log('📹 Intentando obtener stream con video:', includeVideo, 'audio:', includeAudio);
      
      // Si el usuario no quiere ni video ni audio, crear stream vacío
      if (!includeVideo && !includeAudio) {
        console.log('🔇 Usuario no quiere video ni audio, creando stream vacío');
        return new MediaStream();
      }
      
      // Configurar constraints según preferencias del usuario
      let constraints = {
        audio: includeAudio,
        video: includeVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('📹 Stream local obtenido:', stream.getTracks().length, 'tracks');
        return stream;
      } catch (videoError) {
        console.warn('⚠️ Error con video, intentando solo audio:', videoError.message);
        
        // Si falla con video pero el usuario quiere audio, intentar solo audio
        if (includeAudio) {
          constraints = { audio: true, video: false };
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('🎤 Stream de solo audio obtenido:', audioStream.getTracks().length, 'tracks');
            return audioStream;
          } catch (audioError) {
            console.warn('⚠️ Error con audio, creando stream silencioso:', audioError.message);
            
            // Notificar al usuario sobre el problema
            if (audioError.name === 'NotAllowedError') {
              console.log('🚫 Permisos de cámara/micrófono denegados');
            } else if (audioError.name === 'NotFoundError') {
              console.log('📷 No se encontró cámara/micrófono');
            }
            
            // Si todo falla, crear un stream silencioso para que la llamada continúe
            try {
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const destination = audioContext.createMediaStreamDestination();
              oscillator.connect(destination);
              oscillator.frequency.setValueAtTime(0, audioContext.currentTime); // Silencioso
              oscillator.start();
              
              console.log('🔇 Stream silencioso creado para continuar la llamada');
              return destination.stream;
            } catch (contextError) {
              console.warn('⚠️ No se pudo crear AudioContext, usando stream vacío:', contextError.message);
              return new MediaStream();
            }
          }
        } else {
          // Si el usuario no quiere audio, crear stream vacío
          console.log('🔇 Usuario no quiere audio, creando stream vacío');
          return new MediaStream();
        }
      }
    } catch (error) {
      console.error('❌ Error crítico obteniendo stream:', error);
      // Como último recurso, crear un stream vacío
      return new MediaStream();
    }
  },

  // Crear peer connection
  createPeerConnection: () => {
    const { iceServers } = get();
    
    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10
    });

    // Manejar candidatos ICE
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Enviando candidato ICE:', event.candidate.type);
        const { socket, caller, receiver } = get();
        if (socket && (caller || receiver)) {
          const targetUserId = caller ? caller._id : receiver._id;
          socket.emit('ice-candidate', {
            to: targetUserId,
            candidate: event.candidate
          });
        }
      } else {
        console.log('🧊 Todos los candidatos ICE han sido enviados');
      }
    };

    // Manejar estado de conexión
    pc.onconnectionstatechange = () => {
      console.log('🔗 Estado de conexión WebRTC:', pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        console.log('✅ Conexión WebRTC establecida exitosamente');
        set({ isConnected: true });
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('❌ Conexión WebRTC perdida o falló');
        set({ isConnected: false });
      }
    };

    // Manejar estado ICE
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 Estado ICE:', pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('✅ Conexión ICE establecida');
        set({ isConnected: true });
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        console.log('❌ Conexión ICE perdida o falló');
        set({ isConnected: false });
      }
    };

    // Manejar stream remoto
    pc.ontrack = (event) => {
      console.log('📹 Stream remoto recibido');
      console.log('📹 Track kind:', event.track.kind);
      console.log('📹 Track label:', event.track.label);
      const [stream] = event.streams;
      console.log('📹 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.label}`));
      set({ remoteStream: stream, isConnected: true });
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

  // Obtener pantallas disponibles para compartir
  getAvailableScreens: async () => {
    try {
      if (window.electronAPI) {
        // En Electron, usar desktopCapturer para obtener fuentes reales
        console.log('🖥️ Obteniendo fuentes de escritorio desde Electron...');
        const sources = await window.electronAPI.getDesktopSources();
        console.log('📺 Fuentes encontradas:', sources.length);
        
        set({ 
          availableScreens: sources.map(source => ({
            id: source.id,
            name: source.name,
            thumbnail: source.thumbnail,
            type: source.id.startsWith('screen:') ? 'screen' : 'window',
            appIcon: source.appIcon
          }))
        });
      } else {
        // En navegadores web, usar opciones genéricas
        set({ 
          availableScreens: [
            { id: 'screen', name: 'Pantalla completa', type: 'screen' },
            { id: 'window', name: 'Ventana de aplicación', type: 'window' },
            { id: 'tab', name: 'Pestaña del navegador', type: 'browser' }
          ]
        });
      }
    } catch (error) {
      console.error('❌ Error obteniendo pantallas:', error);
      set({ availableScreens: [] });
    }
  },

  // Iniciar compartir pantalla
  startScreenShare: async (sourceId = null) => {
    try {
      let screenStream;
      
      if (window.electronAPI && sourceId) {
        // En Electron, usar getUserMedia con chromeMediaSourceId
        console.log('🖥️ Iniciando screen share con fuente:', sourceId);
        screenStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              minWidth: 1280,
              maxWidth: 1920,
              minHeight: 720,
              maxHeight: 1080
            }
          }
        });
      } else {
        // En navegadores web, usar getDisplayMedia
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor'
          },
          audio: true
        });
      }

      const { peerConnection } = get();
      
      if (peerConnection) {
        // Reemplazar el track de video con el de pantalla
        const videoTrack = screenStream.getVideoTracks()[0];
        console.log('🔍 Video track obtenido:', !!videoTrack);
        
        const allSenders = peerConnection.getSenders();
        console.log('🔍 Todos los senders:', allSenders.length);
        console.log('🔍 Senders con tracks:', allSenders.map(s => ({ 
          hasTrack: !!s.track, 
          kind: s.track?.kind,
          trackId: s.track?.id,
          trackLabel: s.track?.label 
        })));
        
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        console.log('🔍 Sender de video encontrado:', !!sender);

        if (sender && videoTrack) {
          console.log('🔄 Reemplazando track de video con pantalla compartida');
          await sender.replaceTrack(videoTrack);
          console.log('✅ Track reemplazado exitosamente');
        } else if (videoTrack) {
          // Si no hay sender de video, agregar el track de pantalla
          console.log('➕ Agregando track de pantalla compartida (no había video previo)');
          peerConnection.addTrack(videoTrack, screenStream);
          console.log('✅ Track agregado exitosamente');
          
          // Crear nueva oferta para renegociación
          console.log('🔄 Creando nueva oferta para renegociación...');
          
          // Verificar tracks antes de crear la oferta
          const sendersBeforeOffer = peerConnection.getSenders();
          console.log('🔍 Senders antes de crear oferta:', sendersBeforeOffer.map(s => ({
            kind: s.track?.kind,
            trackId: s.track?.id,
            enabled: s.track?.enabled,
            readyState: s.track?.readyState
          })));
          
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          console.log('🔄 Oferta de renegociación creada:', offer.type);
          console.log('🔍 Oferta SDP:', offer.sdp.substring(0, 300) + '...');
          
          // Enviar la nueva oferta al peer remoto
          const { remoteUser } = get();
          const targetUserId = remoteUser ? remoteUser._id : null;
          
          console.log('🔍 Usuario remoto para renegociación:', remoteUser?.fullName);
          console.log('📤 Enviando renegociación a:', targetUserId);
          
          // Obtener socket desde useAuthStore
          const authSocket = useAuthStore.getState().socket;
          console.log('🔍 Socket para renegociación:', !!authSocket);
          
          if (targetUserId && authSocket) {
            authSocket.emit('video-call-renegotiation', {
              to: targetUserId,
              offer
            });
            console.log('📤 Oferta de renegociación enviada');
          } else {
            console.log('❌ No se puede enviar renegociación - targetUserId:', !!targetUserId, 'socket:', !!authSocket);
          }
        }

        // Manejar cuando el usuario deja de compartir
        videoTrack.onended = () => {
          get().stopScreenShare();
        };

        set({ 
          screenStream, 
          isScreenSharing: true 
        });

        console.log('🖥️ Compartir pantalla iniciado');
        console.log('🖥️ Screen stream tracks:', screenStream.getTracks().map(t => t.kind));
        console.log('🖥️ Peer connection senders:', peerConnection.getSenders().length);
      }
    } catch (error) {
      console.error('❌ Error iniciando compartir pantalla:', error);
    }
  },

  // Detener compartir pantalla
  stopScreenShare: async () => {
    const { screenStream, peerConnection, localStream } = get();

    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection && localStream) {
      // Volver al video de la cámara
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
    const { localStream, remoteStream, screenStream } = get();

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (remoteStream) {
      // El stream remoto se limpia automáticamente cuando se cierra la conexión
      // pero podemos hacer log para debugging
      console.log('🧹 Limpiando stream remoto');
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

  // Resetear estado de llamada
  resetCallState: () => {
    set({
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
      availableScreens: [],
      pendingOffer: null
    });
  },

  // Configurar llamada entrante
  setIncomingCall: (caller, callType) => {
    set({
      isIncomingCall: true,
      caller,
      callType
    });
  },

  // Suscribirse a eventos de videollamada
  subscribeToVideoCallEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.log('❌ Socket no disponible para eventos de videollamada');
      return;
    }

    console.log('🔌 Suscribiéndose a eventos de videollamada');
    console.log('🔌 Socket disponible:', !!socket);

    socket.on('video-call-offer', (data) => {
      console.log('🔔 EVENTO RECIBIDO: video-call-offer');
      console.log('📞 Llamada entrante de:', data.caller.fullName);
      console.log('📞 Datos completos de la oferta:', data);
      console.log('📞 Socket que recibió:', socket.id);
      
      // Configurar llamada entrante y guardar la oferta
      set({
        isIncomingCall: true,
        caller: data.caller,
        callType: data.callType,
        pendingOffer: data.offer
      });
      
      console.log('📞 Estado actualizado - isIncomingCall:', true);
      console.log('📞 Estado actual del store:', get());
    });

    // Respuesta de llamada
    socket.on('video-call-answer', async (data) => {
      console.log('✅ Respuesta de llamada recibida');
      const { peerConnection } = get();
      
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // Candidato ICE
    socket.on('ice-candidate', async (data) => {
      const { peerConnection } = get();
      
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    // Llamada rechazada
    socket.on('video-call-rejected', () => {
      console.log('❌ Llamada rechazada');
      get().resetCallState();
    });

    // Llamada terminada
    socket.on('video-call-ended', () => {
      console.log('📞 Llamada terminada por el otro usuario');
      get().cleanupStreams();
      get().resetCallState();
    });

    // Llamada fallida (usuario offline, etc.)
    socket.on('video-call-failed', (data) => {
      console.log('❌ Llamada fallida:', data.reason);
      alert(`No se pudo realizar la llamada: ${data.reason}`);
      get().resetCallState();
    });

    // Solicitud de oferta WebRTC real
    socket.on('video-call-request-real-offer', async (data) => {
      console.log('📞 Solicitud de oferta real recibida de:', data.from);
      
      const { peerConnection, isOutgoingCall } = get();
      if (peerConnection) {
        console.log('🔍 Estado antes de crear oferta real:', peerConnection.signalingState);
        console.log('🔍 Es llamada saliente:', isOutgoingCall);
        
        // Solo el iniciador debe crear y enviar la oferta real
        if (isOutgoingCall) {
          try {
            // Crear nueva oferta WebRTC real
            const realOffer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(realOffer);
            console.log('🔍 Estado después de setLocalDescription:', peerConnection.signalingState);
            
            // Enviar la oferta real
            socket.emit('video-call-real-offer', {
              to: data.from,
              offer: realOffer
            });
            
            console.log('📞 Oferta WebRTC real enviada');
          } catch (error) {
            console.error('❌ Error creando oferta real:', error);
          }
        } else {
          console.log('⚠️ Ignorando solicitud de oferta real - no somos el iniciador');
        }
      }
    });

    // Recibir oferta WebRTC real
    socket.on('video-call-real-offer', async (data) => {
      console.log('📞 Oferta WebRTC real recibida');
      
      const { peerConnection, isOutgoingCall } = get();
      if (peerConnection) {
        console.log('🔍 Estado antes de procesar oferta real:', peerConnection.signalingState);
        console.log('🔍 Es llamada saliente:', isOutgoingCall);
        
        // Solo el receptor (no el iniciador) debe procesar la oferta real
        if (!isOutgoingCall) {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            console.log('🔍 Estado después de setRemoteDescription:', peerConnection.signalingState);
            
            // Crear respuesta
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            console.log('🔍 Estado después de setLocalDescription:', peerConnection.signalingState);
            
            // Enviar respuesta
            socket.emit('video-call-answer', {
              to: data.from,
              answer
            });
            
            console.log('📞 Respuesta a oferta real enviada');
          } catch (error) {
            console.error('❌ Error procesando oferta real:', error);
          }
        } else {
          console.log('⚠️ Ignorando oferta real - somos el iniciador de la llamada');
        }
      }
    });

    // Recibir respuesta WebRTC
    socket.on('video-call-answer', async (data) => {
      console.log('📞 Respuesta WebRTC recibida');
      
      const { peerConnection, isOutgoingCall } = get();
      if (peerConnection) {
        console.log('🔍 Estado actual del peer connection:', peerConnection.signalingState);
        console.log('🔍 Local description:', !!peerConnection.localDescription);
        console.log('🔍 Remote description:', !!peerConnection.remoteDescription);
        console.log('🔍 Es llamada saliente:', isOutgoingCall);
        
        // Verificar si la conexión ya está establecida (estado stable significa que el handshake está completo)
        if (peerConnection.signalingState === 'stable' && peerConnection.connectionState === 'connected') {
          console.log('✅ La conexión WebRTC ya está establecida!');
          set({ isConnected: true });
          return;
        }
        
        // Solo procesar la respuesta si somos quien inició la llamada Y estamos en el estado correcto
        if (isOutgoingCall && peerConnection.signalingState === 'have-local-offer' && !peerConnection.remoteDescription) {
          try {
            // Verificar estado una vez más justo antes de establecer la descripción
            console.log('🔍 Estado final antes de setRemoteDescription:', peerConnection.signalingState);
            
            if (peerConnection.signalingState === 'have-local-offer') {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
              console.log('📞 Respuesta WebRTC configurada exitosamente');
            } else {
              console.log('⚠️ Estado cambió antes de setRemoteDescription:', peerConnection.signalingState);
              // Si el estado es stable, verificar si la conexión ya está establecida
              if (peerConnection.signalingState === 'stable') {
                console.log('🔍 Verificando si la conexión ya está establecida...');
                console.log('🔍 Connection state:', peerConnection.connectionState);
                console.log('🔍 ICE connection state:', peerConnection.iceConnectionState);
                
                if (peerConnection.connectionState === 'connected' || peerConnection.iceConnectionState === 'connected') {
                  console.log('✅ La conexión ya está establecida, actualizando estado');
                  set({ isConnected: true });
                }
              }
            }
          } catch (error) {
            console.error('❌ Error configurando respuesta WebRTC:', error);
            console.error('❌ Estado actual:', peerConnection.signalingState);
            
            // Si el error es porque ya está en estado stable, verificar la conexión
            if (peerConnection.signalingState === 'stable') {
              console.log('🔍 Verificando conexión después del error...');
              console.log('🔍 Connection state:', peerConnection.connectionState);
              console.log('🔍 ICE connection state:', peerConnection.iceConnectionState);
              
              if (peerConnection.connectionState === 'connected' || peerConnection.iceConnectionState === 'connected') {
                console.log('✅ La conexión está establecida a pesar del error');
                set({ isConnected: true });
              }
            }
          }
        } else {
          console.log('⚠️ Ignorando respuesta WebRTC - no somos el iniciador o estado incorrecto');
          console.log('⚠️ isOutgoingCall:', isOutgoingCall, 'signalingState:', peerConnection.signalingState, 'hasRemoteDescription:', !!peerConnection.remoteDescription);
        }
      }
    });

    // Recibir candidatos ICE
    socket.on('ice-candidate', async (data) => {
      console.log('🧊 Candidato ICE recibido:', data.candidate.type);
      
      const { peerConnection } = get();
      if (peerConnection) {
        console.log('🔍 Estado del peer connection al recibir ICE:', peerConnection.signalingState);
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('🧊 Candidato ICE agregado exitosamente');
        } catch (error) {
          console.error('❌ Error agregando candidato ICE:', error);
        }
      }
    });

    // Renegociación para screen sharing
    socket.on('video-call-renegotiation', async (data) => {
      console.log('🔄 Renegociación recibida para screen sharing de:', data.from);
      console.log('🔄 Oferta recibida tipo:', data.offer?.type);
      
      const { peerConnection, isOutgoingCall } = get();
      if (peerConnection) {
        try {
          console.log('🔄 Estado del peer connection antes de renegociación:', peerConnection.signalingState);
          console.log('🔍 Es llamada saliente (receptor):', isOutgoingCall);
          
          // Manejar conflicto de glare (ambos en have-local-offer)
          if (peerConnection.signalingState === 'have-local-offer') {
            console.log('⚠️ Conflicto de glare detectado - ambos en have-local-offer');
            
            // El que recibe la renegociación siempre debe hacer rollback para procesar la oferta entrante
            console.log('🔧 Haciendo rollback para procesar renegociación entrante...');
            
            try {
              // Rollback: volver al estado stable
              await peerConnection.setLocalDescription({type: 'rollback'});
              console.log('🔄 Rollback aplicado exitosamente, estado actual:', peerConnection.signalingState);
            } catch (rollbackError) {
              console.error('❌ Error en rollback:', rollbackError);
              console.log('🔧 Intentando continuar sin rollback...');
            }
          }
          
          // Si aún no está en stable después del rollback, esperar un poco
          if (peerConnection.signalingState !== 'stable') {
            console.log('⚠️ Peer connection no está en estado stable, esperando...');
            
            // Esperar hasta que esté en estado stable (máximo 2 segundos)
            let attempts = 0;
            const maxAttempts = 20; // 20 intentos x 100ms = 2 segundos
            
            while (peerConnection.signalingState !== 'stable' && attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
              console.log(`🔄 Intento ${attempts}: Estado actual: ${peerConnection.signalingState}`);
            }
            
            if (peerConnection.signalingState !== 'stable') {
              console.log('❌ Timeout: Peer connection no llegó a estado stable');
              console.log('❌ Estado final:', peerConnection.signalingState);
              return; // Salir si no se puede procesar
            }
            
            console.log('✅ Peer connection ahora está en estado stable');
          }
          
          console.log('🔄 Configurando descripción remota para renegociación');
          console.log('🔍 Oferta recibida SDP:', data.offer.sdp.substring(0, 200) + '...');
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          console.log('✅ Descripción remota configurada');
          
          console.log('🔄 Creando respuesta para renegociación');
          const answer = await peerConnection.createAnswer();
          console.log('🔄 Respuesta creada tipo:', answer.type);
          console.log('🔍 Respuesta SDP:', answer.sdp.substring(0, 200) + '...');
          await peerConnection.setLocalDescription(answer);
          console.log('✅ Descripción local configurada');
          
          // Enviar respuesta de renegociación
          const { caller, receiver } = get();
          const authSocket = useAuthStore.getState().socket;
          console.log('🔍 Socket para respuesta de renegociación:', !!authSocket);
          
          if (authSocket && (caller || receiver)) {
            const targetUserId = caller ? caller._id : receiver._id;
            console.log('📤 Enviando respuesta de renegociación a:', targetUserId);
            authSocket.emit('video-call-renegotiation-answer', {
              to: targetUserId,
              answer
            });
            console.log('📤 Respuesta de renegociación enviada');
          
          // Esperar un poco para que los tracks se configuren completamente
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Actualizar el stream remoto después de la renegociación exitosa
          console.log('🔄 Verificando streams después de renegociación...');
          console.log('🔍 Peer connection disponible:', !!peerConnection);
          
          if (peerConnection) {
            // Usar getReceivers (método moderno) en lugar de getRemoteStreams (deprecated)
            const receivers = peerConnection.getReceivers();
            console.log('📹 Receivers disponibles:', receivers.length);
            console.log('📹 Receivers con tracks:', receivers.map(r => ({
              kind: r.track?.kind,
              trackId: r.track?.id,
              enabled: r.track?.enabled,
              readyState: r.track?.readyState,
              label: r.track?.label
            })));
            
            // Crear un nuevo stream con todos los tracks recibidos
            const receiverTracks = receivers.map(r => r.track).filter(Boolean);
            if (receiverTracks.length > 0) {
              console.log('🔄 Creando stream actualizado desde receivers...');
              const newStream = new MediaStream(receiverTracks);
              
              console.log('📹 Nuevo stream creado con tracks:', newStream.getTracks().map(t => ({
                kind: t.kind,
                id: t.id,
                enabled: t.enabled,
                readyState: t.readyState,
                label: t.label
              })));
              
              set({ remoteStream: newStream });
              console.log('✅ Stream remoto actualizado después de renegociación con', receiverTracks.length, 'tracks');
            } else {
              console.log('⚠️ No hay tracks en los receivers para crear stream');
            }
          }
          
          } else {
            console.log('❌ No se puede enviar respuesta de renegociación - socket:', !!authSocket, 'caller/receiver:', !!(caller || receiver));
          }
        } catch (error) {
          console.error('❌ Error en renegociación:', error);
          console.error('❌ Tipo de error:', error.name);
          console.error('❌ Mensaje de error:', error.message);
          console.error('❌ Estado del peer connection al fallar:', peerConnection.signalingState);
        }
      }
    });

    // Respuesta de renegociación
    socket.on('video-call-renegotiation-answer', async (data) => {
      console.log('✅ Respuesta de renegociación recibida de:', data.from);
      console.log('✅ Respuesta tipo:', data.answer?.type);
      
      const { peerConnection } = get();
      if (peerConnection && data.answer) {
        try {
          console.log('🔍 Estado del peer connection antes de procesar respuesta:', peerConnection.signalingState);
          
          // Validar que estemos en el estado correcto para procesar la respuesta
          if (peerConnection.signalingState !== 'have-local-offer') {
            console.log('⚠️ Estado inesperado para procesar respuesta:', peerConnection.signalingState);
            return;
          }
          
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('✅ Respuesta de renegociación procesada exitosamente');
          console.log('🔍 Estado después de procesar respuesta:', peerConnection.signalingState);
          
          // Esperar un poco para que los tracks se configuren completamente
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Verificar y actualizar streams después de la renegociación exitosa
          console.log('🔄 Verificando streams después de procesar respuesta...');
          
          // Usar getReceivers (método moderno) para obtener todos los tracks
          const receivers = peerConnection.getReceivers();
          console.log('📹 Receivers después de respuesta:', receivers.length);
          console.log('📹 Receivers con tracks:', receivers.map(r => ({
            kind: r.track?.kind,
            trackId: r.track?.id,
            enabled: r.track?.enabled,
            readyState: r.track?.readyState,
            label: r.track?.label
          })));
          
          // Crear un nuevo stream con todos los tracks recibidos
          const receiverTracks = receivers.map(r => r.track).filter(Boolean);
          if (receiverTracks.length > 0) {
            console.log('🔄 Creando stream actualizado desde receivers después de respuesta...');
            const newStream = new MediaStream(receiverTracks);
            
            console.log('📹 Nuevo stream creado con tracks:', newStream.getTracks().map(t => ({
              kind: t.kind,
              id: t.id,
              enabled: t.enabled,
              readyState: t.readyState,
              label: t.label
            })));
            
            set({ remoteStream: newStream });
            console.log('✅ Stream remoto actualizado después de procesar respuesta con', receiverTracks.length, 'tracks');
          } else {
            console.log('⚠️ No hay tracks en los receivers después de la renegociación');
          }
          
        } catch (error) {
          console.error('❌ Error procesando respuesta de renegociación:', error);
          console.error('❌ Estado del peer connection al fallar:', peerConnection.signalingState);
        }
      } else {
        console.log('❌ No hay peer connection o respuesta para renegociación');
      }
    });
  },
  unsubscribeFromVideoCallEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off('video-call-offer');
    socket.off('video-call-answer');
    socket.off('video-call-request-real-offer');
    socket.off('video-call-real-offer');
    socket.off('ice-candidate');
    socket.off('video-call-rejected');
    socket.off('video-call-ended');
    socket.off('video-call-failed');
    socket.off('video-call-renegotiation');
    socket.off('video-call-renegotiation-answer');
  }
}));
