import axios from "axios";

// Función para obtener la URL base del servidor
async function getBaseURL() {
  // Verificar si estamos en Electron
  if (window.electronAPI) {
    try {
      const config = await window.electronAPI.getTunnelUrl();
      console.log('🔍 Axios - Electron config recibido:', config);
      
      // CONFIAR EN LA DETECCIÓN AUTOMÁTICA DE ELECTRON
      if (config.serverMode) {
        console.log('💻 Axios - Modo SERVIDOR (localhost)');
        return 'http://localhost:5000/api';
      } else if (config.clientUrl) {
        console.log('💻 Axios - Modo CLIENTE:', config.clientUrl);
        return `${config.clientUrl}/api`;
      } else {
        console.log('⚠️ Axios - Config incompleto, usando localhost');
        return 'http://localhost:5000/api';
      }
    } catch (error) {
      console.error('❌ Axios - Error getting Electron config:', error);
      return 'http://localhost:5000/api';
    }
  }
  
  // Si estamos en desarrollo web, usar localhost
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5001/api";
  }
  
  // En producción web, usar ruta relativa
  return "/api";
}

// Crear instancia de axios
export const axiosInstance = axios.create({
  withCredentials: true,
});

// Configurar interceptor para establecer baseURL dinámicamente
axiosInstance.interceptors.request.use(async (config) => {
  if (!config.baseURL) {
    const baseURL = await getBaseURL();
    config.baseURL = baseURL;
  }
  return config;
});

// Contador de errores 502 consecutivos
let consecutive502Errors = 0;
const MAX_502_ERRORS = 3;

// Interceptor de respuesta para manejar errores de conexión
axiosInstance.interceptors.response.use(
  (response) => {
    // Resetear contador si la respuesta es exitosa
    consecutive502Errors = 0;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si es un error 502 (Bad Gateway)
    if (error.response?.status === 502) {
      consecutive502Errors++;
      console.log(`🔄 Error 502 detectado (${consecutive502Errors}/${MAX_502_ERRORS})`);
      
      // Si hemos tenido muchos errores 502 y estamos en Electron, cambiar a modo servidor
      if (consecutive502Errors >= MAX_502_ERRORS && window.electronAPI) {
        console.log('❌ Demasiados errores 502, cambiando a modo servidor...');
        try {
          const result = await window.electronAPI.forceServerMode();
          if (result.success) {
            console.log('✅ Cambiado a modo servidor exitosamente');
            // Recargar la página para aplicar el nuevo modo
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            return Promise.reject(new Error('Switching to server mode, please wait...'));
          }
        } catch (switchError) {
          console.error('❌ Error cambiando a modo servidor:', switchError);
        }
      }
      
      // Reintentar solo si no hemos reintentado ya
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        await new Promise(resolve => setTimeout(resolve, 2000));
        return axiosInstance(originalRequest);
      }
    }
    
    // Si es un error de conexión (ECONNREFUSED, etc.) y no hemos reintentado
    if ((error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') && !originalRequest._retry) {
      console.log('🔄 Axios interceptor: Error de conexión detectado, reintentando en 3 segundos...', {
        url: originalRequest.url,
        method: originalRequest.method,
        error: error.code
      });
      originalRequest._retry = true;
      originalRequest._isRetry = true; // Marcar como reintento para evitar mostrar error al usuario
      
      // Esperar 3 segundos antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔄 Axios interceptor: Reintentando petición...');
      // Reintentar la petición
      return axiosInstance(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Función para verificar la salud del servidor
export const checkServerHealth = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🏥 Verificando salud del servidor (intento ${i + 1}/${retries})...`);
      const baseURL = await getBaseURL();
      
      // Crear AbortController manualmente para mejor compatibilidad
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseURL}/auth/check`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Aceptar tanto 200 (autenticado) como 401 (no autenticado) como servidor saludable
      if (response.ok || response.status === 401) {
        console.log('✅ Servidor saludable');
        return true;
      }
    } catch (error) {
      console.log(`❌ Servidor no disponible (intento ${i + 1}): ${error.message}`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log('❌ Servidor no disponible después de todos los intentos');
  return false;
};

// Función para actualizar la URL base cuando cambie el túnel
export const updateBaseURL = (tunnelUrl) => {
  if (tunnelUrl) {
    axiosInstance.defaults.baseURL = `${tunnelUrl}/api`;
  }
};
