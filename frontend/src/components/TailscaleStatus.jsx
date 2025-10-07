import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const TailscaleStatus = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Escuchar mensajes de Tailscale desde el proceso principal
    const handleTailscaleMessage = (event, data) => {
      console.log('🔔 Mensaje de Tailscale:', data);
      setStatus(data);
      
      // Mostrar toast con el mensaje
      if (data.message.includes('✅')) {
        toast.success(data.message + '\n' + data.action, {
          duration: 5000,
          position: 'top-center',
        });
      } else if (data.message.includes('❌')) {
        toast.error(data.message + '\n' + data.action, {
          duration: 10000,
          position: 'top-center',
        });
      } else {
        toast.loading(data.message + '\n' + data.action, {
          duration: 15000,
          position: 'top-center',
        });
      }
    };

    // Registrar listener
    if (window.electronAPI.onTailscaleMessage) {
      window.electronAPI.onTailscaleMessage(handleTailscaleMessage);
    }

    return () => {
      // Limpiar listener
      if (window.electronAPI.removeAllListeners) {
        window.electronAPI.removeAllListeners('show-tailscale-connect-message');
      }
    };
  }, []);

  // No renderizar nada, solo maneja los toasts
  if (!status) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
                    bg-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl
                    max-w-md text-center animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <div>
          <p className="font-semibold">{status.message}</p>
          <p className="text-sm text-blue-100 mt-1">{status.action}</p>
        </div>
      </div>
    </div>
  );
};

export default TailscaleStatus;
