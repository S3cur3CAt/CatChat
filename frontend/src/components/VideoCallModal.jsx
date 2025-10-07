import { useState, useEffect } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useVideoCallStore } from "../store/useVideoCallStore";

const VideoCallModal = () => {
  const {
    isIncomingCall,
    caller,
    callType,
    acceptCall,
    rejectCall,
    pendingOffer
  } = useVideoCallStore();

  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    console.log('🔔 VideoCallModal - isIncomingCall:', isIncomingCall);
    console.log('🔔 VideoCallModal - caller:', caller);
    
    if (isIncomingCall) {
      console.log('🔔 Mostrando modal de llamada entrante');
      setIsRinging(true);
      // Reproducir sonido de llamada (opcional)
      // const audio = new Audio('/ringtone.mp3');
      // audio.loop = true;
      // audio.play();
    } else {
      setIsRinging(false);
    }
  }, [isIncomingCall, caller]);

  const handleAccept = async () => {
    if (pendingOffer && caller) {
      await acceptCall(pendingOffer, caller);
    }
  };

  const handleReject = () => {
    rejectCall();
  };

  if (!isIncomingCall || !caller) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-white overflow-hidden">
        {/* Header con animación de llamada */}
        <div className="relative p-6 text-center">
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 ${isRinging ? 'animate-pulse' : ''}`}></div>
          
          <div className="relative z-10">
            <div className="text-sm text-blue-200 mb-2 uppercase tracking-wide">
              {callType === 'video' ? 'Videollamada entrante' : 'Llamada entrante'}
            </div>
            
            {/* Avatar del usuario que llama */}
            <div className="relative mx-auto mb-4">
              <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 ${isRinging ? 'animate-bounce' : ''}`}>
                <img
                  src={caller.profilePic || "/avatar.png"}
                  alt={caller.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Indicador de tipo de llamada */}
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                {callType === 'video' ? (
                  <Video size={16} className="text-white" />
                ) : (
                  <Phone size={16} className="text-white" />
                )}
              </div>
            </div>

            {/* Nombre del usuario */}
            <h2 className="text-xl font-semibold mb-1">
              {caller.fullName}
            </h2>
            
            {/* Estado de la llamada */}
            <p className="text-blue-200 text-sm">
              {isRinging ? 'Llamando...' : 'Conectando...'}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-6 pb-6">
          <div className="flex justify-center gap-6">
            {/* Botón rechazar */}
            <button
              onClick={handleReject}
              className="group relative bg-red-500 hover:bg-red-600 rounded-full p-4 transition-all duration-200 transform hover:scale-110 active:scale-95"
              title="Rechazar llamada"
            >
              <PhoneOff size={24} className="text-white" />
              
              {/* Efecto de ondas */}
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 group-hover:opacity-30"></div>
            </button>

            {/* Botón aceptar */}
            <button
              onClick={handleAccept}
              className="group relative bg-green-500 hover:bg-green-600 rounded-full p-4 transition-all duration-200 transform hover:scale-110 active:scale-95"
              title="Aceptar llamada"
            >
              <Phone size={24} className="text-white" />
              
              {/* Efecto de ondas */}
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20 group-hover:opacity-30"></div>
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-4 text-center">
            <p className="text-xs text-blue-200/70">
              {callType === 'video' 
                ? 'La videollamada incluirá video y audio' 
                : 'Solo se compartirá audio'
              }
            </p>
          </div>
        </div>

        {/* Indicador visual de llamada activa */}
        {isRinging && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500">
            <div className="h-full bg-white/30 animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Overlay con patrón decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-16 h-16 border border-white/10 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 border border-white/10 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border border-white/10 rounded-full animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default VideoCallModal;
