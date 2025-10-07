import { useEffect, useRef } from 'react';
import { axiosInstance } from '../lib/axios.js';

// Hook para polling HTTP como fallback cuando WebSockets fallan
export const usePolling = (endpoint, interval = 5000, dependencies = []) => {
  const intervalRef = useRef(null);
  const isPollingRef = useRef(false);

  const startPolling = (callback) => {
    if (isPollingRef.current) return;
    
    isPollingRef.current = true;
    console.log(`🔄 Iniciando polling para ${endpoint} cada ${interval}ms`);

    const poll = async () => {
      try {
        const response = await axiosInstance.get(endpoint);
        if (callback && typeof callback === 'function') {
          callback(response.data);
        }
      } catch (error) {
        console.error(`❌ Error en polling ${endpoint}:`, error);
      }
    };

    // Hacer primera llamada inmediatamente
    poll();

    // Configurar intervalo
    intervalRef.current = setInterval(poll, interval);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
    console.log(`⏹️ Polling detenido para ${endpoint}`);
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, dependencies);

  return { startPolling, stopPolling, isPolling: isPollingRef.current };
};

// Hook específico para polling de usuarios online
export const useOnlineUsersPolling = (onUpdate) => {
  const { startPolling, stopPolling } = usePolling('/api/users/online', 3000);

  const startOnlinePolling = () => {
    startPolling((data) => {
      if (data.onlineUsers && onUpdate) {
        onUpdate(data.onlineUsers);
      }
    });
  };

  return { startOnlinePolling, stopPolling };
};

// Hook para heartbeat (mantener usuario online)
export const useHeartbeat = () => {
  const intervalRef = useRef(null);

  const startHeartbeat = () => {
    if (intervalRef.current) return;

    console.log('💓 Iniciando heartbeat cada 30 segundos');

    const sendHeartbeat = async () => {
      try {
        await axiosInstance.post('/api/users/online');
      } catch (error) {
        console.error('❌ Error en heartbeat:', error);
      }
    };

    // Enviar heartbeat inmediatamente
    sendHeartbeat();

    // Configurar intervalo
    intervalRef.current = setInterval(sendHeartbeat, 30000);
  };

  const stopHeartbeat = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('💓 Heartbeat detenido');
    }
  };

  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, []);

  return { startHeartbeat, stopHeartbeat };
};
