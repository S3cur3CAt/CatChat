import { supabase } from '../lib/supabase';

class SupabaseVideoCallService {
  constructor() {
    this.currentCallId = null;
    this.signalSubscription = null;
    this.callSubscription = null;
    this.onIncomingCall = null;
    this.onSignalReceived = null;
    this.onCallStatusChanged = null;
    this.userId = null;
  }

  // Inicializar el servicio con el usuario actual
  async initialize(userId, callbacks = {}) {
    console.log('🔌 Inicializando servicio de videollamadas con Supabase');
    this.userId = userId;
    
    // Configurar callbacks
    this.onIncomingCall = callbacks.onIncomingCall || (() => {});
    this.onSignalReceived = callbacks.onSignalReceived || (() => {});
    this.onCallStatusChanged = callbacks.onCallStatusChanged || (() => {});
    
    // Limpiar suscripciones anteriores
    await this.cleanup();
    
    // Suscribirse a cambios en video_calls para detectar llamadas entrantes
    this.callSubscription = supabase
      .channel('video_calls_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_calls',
          filter: `receiver_id=eq.${userId}`
        },
        async (payload) => {
          console.log('📞 Nueva llamada entrante:', payload.new);
          
          // Obtener información del caller
          const { data: caller } = await supabase
            .from('users')
            .select('*')
            .eq('id', payload.new.caller_id)
            .single();
          
          if (caller) {
            this.onIncomingCall({
              callId: payload.new.id,
              caller: {
                _id: caller.id,
                fullName: caller.full_name,
                profilePic: caller.profile_pic
              },
              callType: payload.new.call_type
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_calls',
          filter: `caller_id=eq.${userId}`
        },
        (payload) => {
          console.log('📞 Estado de llamada actualizado:', payload.new.status);
          this.onCallStatusChanged(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_calls',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('📞 Estado de llamada actualizado:', payload.new.status);
          this.onCallStatusChanged(payload.new);
        }
      )
      .subscribe();
    
    // Suscribirse a señales WebRTC
    this.signalSubscription = supabase
      .channel('webrtc_signals_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webrtc_signals',
          filter: `to_user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('🧊 Nueva señal WebRTC recibida:', payload.new.signal_type);
          
          // Marcar la señal como procesada
          await supabase
            .from('webrtc_signals')
            .update({ processed: true })
            .eq('id', payload.new.id);
          
          // Emitir la señal al store
          this.onSignalReceived({
            type: payload.new.signal_type,
            data: payload.new.signal_data,
            callId: payload.new.call_id,
            fromUserId: payload.new.from_user_id
          });
        }
      )
      .subscribe();
    
    console.log('✅ Servicio de videollamadas inicializado');
  }

  // Iniciar una nueva videollamada
  async startCall(receiverId, callType = 'video') {
    console.log('📞 Iniciando videollamada con:', receiverId);
    
    try {
      // Llamar a la función de Supabase para iniciar la llamada
      const { data, error } = await supabase
        .rpc('start_video_call', {
          p_caller_id: this.userId,
          p_receiver_id: receiverId,
          p_call_type: callType
        });
      
      if (error) {
        console.error('❌ Error iniciando llamada:', error);
        return null;
      }
      
      this.currentCallId = data;
      console.log('✅ Llamada iniciada con ID:', this.currentCallId);
      
      return this.currentCallId;
    } catch (error) {
      console.error('❌ Error iniciando llamada:', error);
      return null;
    }
  }

  // Aceptar una llamada entrante
  async acceptCall(callId) {
    console.log('✅ Aceptando llamada:', callId);
    
    try {
      const { error } = await supabase
        .rpc('accept_video_call', { p_call_id: callId });
      
      if (error) {
        console.error('❌ Error aceptando llamada:', error);
        return false;
      }
      
      this.currentCallId = callId;
      return true;
    } catch (error) {
      console.error('❌ Error aceptando llamada:', error);
      return false;
    }
  }

  // Rechazar una llamada entrante
  async rejectCall(callId) {
    console.log('❌ Rechazando llamada:', callId);
    
    try {
      const { error } = await supabase
        .rpc('reject_video_call', { p_call_id: callId });
      
      if (error) {
        console.error('❌ Error rechazando llamada:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error rechazando llamada:', error);
      return false;
    }
  }

  // Finalizar una llamada
  async endCall(callId = null) {
    const targetCallId = callId || this.currentCallId;
    
    if (!targetCallId) {
      console.warn('⚠️ No hay llamada activa para finalizar');
      return false;
    }
    
    console.log('📞 Finalizando llamada:', targetCallId);
    
    try {
      const { error } = await supabase
        .rpc('end_video_call', { p_call_id: targetCallId });
      
      if (error) {
        console.error('❌ Error finalizando llamada:', error);
        return false;
      }
      
      this.currentCallId = null;
      return true;
    } catch (error) {
      console.error('❌ Error finalizando llamada:', error);
      return false;
    }
  }

  // Enviar una señal WebRTC (offer, answer, ice-candidate, etc.)
  async sendSignal(toUserId, signalType, signalData, callId = null) {
    const targetCallId = callId || this.currentCallId;
    
    if (!targetCallId) {
      console.error('❌ No hay llamada activa para enviar señal');
      return false;
    }
    
    console.log(`🧊 Enviando señal ${signalType} a:`, toUserId);
    
    try {
      const { error } = await supabase
        .from('webrtc_signals')
        .insert({
          call_id: targetCallId,
          from_user_id: this.userId,
          to_user_id: toUserId,
          signal_type: signalType,
          signal_data: signalData
        });
      
      if (error) {
        console.error('❌ Error enviando señal:', error);
        return false;
      }
      
      console.log('✅ Señal enviada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error enviando señal:', error);
      return false;
    }
  }

  // Obtener llamadas activas del usuario
  async getActiveCalls() {
    try {
      const { data, error } = await supabase
        .rpc('get_active_calls', { user_id: this.userId });
      
      if (error) {
        console.error('❌ Error obteniendo llamadas activas:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo llamadas activas:', error);
      return [];
    }
  }

  // Obtener señales pendientes
  async getPendingSignals() {
    try {
      const { data, error } = await supabase
        .from('webrtc_signals')
        .select('*')
        .eq('to_user_id', this.userId)
        .eq('processed', false)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Error obteniendo señales pendientes:', error);
        return [];
      }
      
      // Marcar las señales como procesadas
      if (data && data.length > 0) {
        const signalIds = data.map(s => s.id);
        await supabase
          .from('webrtc_signals')
          .update({ processed: true })
          .in('id', signalIds);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo señales pendientes:', error);
      return [];
    }
  }

  // Actualizar el estado de una llamada
  async updateCallStatus(callId, status) {
    console.log(`📞 Actualizando estado de llamada ${callId} a:`, status);
    
    try {
      const updateData = { status };
      
      // Si la llamada está conectada, actualizar started_at
      if (status === 'connected') {
        updateData.started_at = new Date().toISOString();
      }
      
      // Si la llamada termina, actualizar ended_at
      if (status === 'ended' || status === 'rejected') {
        updateData.ended_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('video_calls')
        .update(updateData)
        .eq('id', callId);
      
      if (error) {
        console.error('❌ Error actualizando estado de llamada:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error actualizando estado de llamada:', error);
      return false;
    }
  }

  // Limpiar suscripciones y recursos
  async cleanup() {
    console.log('🧹 Limpiando servicio de videollamadas');
    
    if (this.signalSubscription) {
      await this.signalSubscription.unsubscribe();
      this.signalSubscription = null;
    }
    
    if (this.callSubscription) {
      await this.callSubscription.unsubscribe();
      this.callSubscription = null;
    }
    
    this.currentCallId = null;
  }

  // Método estático para limpiar señales antiguas (llamar periódicamente)
  static async cleanupOldSignals() {
    try {
      const { error } = await supabase
        .rpc('cleanup_old_webrtc_signals');
      
      if (error) {
        console.error('❌ Error limpiando señales antiguas:', error);
      } else {
        console.log('🧹 Señales antiguas limpiadas');
      }
    } catch (error) {
      console.error('❌ Error limpiando señales antiguas:', error);
    }
  }
}

// Crear instancia singleton
const supabaseVideoCallService = new SupabaseVideoCallService();

// Limpiar señales antiguas cada 5 minutos
setInterval(() => {
  SupabaseVideoCallService.cleanupOldSignals();
}, 5 * 60 * 1000);

export default supabaseVideoCallService;
