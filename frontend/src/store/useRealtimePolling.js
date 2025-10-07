import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useRealtimePolling = create((set, get) => ({
  onlineUsers: [],
  typingUsers: [],
  isPolling: false,
  intervals: {
    heartbeat: null,
    onlineUsers: null,
    typing: null
  },

  // Iniciar todos los sistemas de polling
  startPolling: (userId) => {
    if (get().isPolling) return;
    
    console.log('🔄 Iniciando sistema de polling HTTP para tiempo real');
    set({ isPolling: true });

    const intervals = {};

    // 1. Heartbeat cada 30 segundos para mantener usuario online
    intervals.heartbeat = setInterval(async () => {
      try {
        const response = await axiosInstance.post('/api/realtime/heartbeat');
        if (response.data.onlineUsers) {
          set({ onlineUsers: response.data.onlineUsers });
        }
      } catch (error) {
        console.error('❌ Error en heartbeat:', error);
      }
    }, 30000);

    // 2. Polling de usuarios online cada 3 segundos
    intervals.onlineUsers = setInterval(async () => {
      try {
        const response = await axiosInstance.get('/api/realtime/online-users');
        if (response.data.onlineUsers) {
          set({ onlineUsers: response.data.onlineUsers });
        }
      } catch (error) {
        console.error('❌ Error obteniendo usuarios online:', error);
      }
    }, 3000);

    // 3. Polling de eventos de typing cada 2 segundos
    intervals.typing = setInterval(async () => {
      try {
        const response = await axiosInstance.get(`/api/realtime/typing/${userId}`);
        if (response.data.typingUsers) {
          set({ typingUsers: response.data.typingUsers });
        }
      } catch (error) {
        console.error('❌ Error obteniendo eventos de typing:', error);
      }
    }, 2000);

    set({ intervals });

    // Hacer llamadas iniciales
    get().sendHeartbeat();
    get().fetchOnlineUsers();
  },

  // Detener todos los sistemas de polling
  stopPolling: async (userId) => {
    console.log('⏹️ Deteniendo sistema de polling');
    
    const { intervals } = get();
    
    // Limpiar todos los intervalos
    Object.values(intervals).forEach(interval => {
      if (interval) clearInterval(interval);
    });

    // Marcar usuario como offline
    if (userId) {
      try {
        await axiosInstance.post('/api/realtime/offline');
      } catch (error) {
        console.error('❌ Error marcando usuario offline:', error);
      }
    }

    set({ 
      isPolling: false,
      intervals: { heartbeat: null, onlineUsers: null, typing: null },
      typingUsers: []
    });
  },

  // Enviar heartbeat manual
  sendHeartbeat: async () => {
    try {
      const response = await axiosInstance.post('/api/realtime/heartbeat');
      if (response.data.onlineUsers) {
        set({ onlineUsers: response.data.onlineUsers });
      }
    } catch (error) {
      console.error('❌ Error en heartbeat manual:', error);
    }
  },

  // Obtener usuarios online manual
  fetchOnlineUsers: async () => {
    try {
      const response = await axiosInstance.get('/api/realtime/online-users');
      if (response.data.onlineUsers) {
        set({ onlineUsers: response.data.onlineUsers });
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuarios online:', error);
    }
  },

  // Enviar evento de typing
  sendTypingEvent: async (receiverId, isTyping) => {
    try {
      await axiosInstance.post('/api/realtime/typing', {
        receiverId,
        isTyping
      });
    } catch (error) {
      console.error('❌ Error enviando evento de typing:', error);
    }
  },

  // Obtener eventos de typing para el usuario actual
  fetchTypingEvents: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/realtime/typing/${userId}`);
      if (response.data.typingUsers) {
        set({ typingUsers: response.data.typingUsers });
      }
    } catch (error) {
      console.error('❌ Error obteniendo eventos de typing:', error);
    }
  }
}));
