import { useState, useEffect } from "react";
import { Video, VideoOff, Mic, MicOff, Phone, X } from "lucide-react";

const CallSettingsModal = ({ isOpen, onClose, onStartCall, receiverName }) => {
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkDeviceAvailability();
    }
  }, [isOpen]);

  const checkDeviceAvailability = async () => {
    setIsChecking(true);
    try {
      // Verificar dispositivos disponibles
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      setHasCamera(videoDevices.length > 0);
      setHasMicrophone(audioDevices.length > 0);
      
      // Habilitar por defecto si están disponibles
      setVideoEnabled(videoDevices.length > 0);
      setAudioEnabled(audioDevices.length > 0);
      
      console.log('📷 Cámaras disponibles:', videoDevices.length);
      console.log('🎤 Micrófonos disponibles:', audioDevices.length);
    } catch (error) {
      console.warn('⚠️ Error verificando dispositivos:', error);
      setHasCamera(false);
      setHasMicrophone(false);
      setVideoEnabled(false);
      setAudioEnabled(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleStartCall = () => {
    onStartCall({
      video: videoEnabled,
      audio: audioEnabled,
      hasDevices: hasCamera || hasMicrophone
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Configurar videollamada</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-300 mb-2">
              Llamando a <span className="text-white font-medium">{receiverName}</span>
            </p>
            <p className="text-sm text-gray-400">
              Configura tus preferencias de audio y video
            </p>
          </div>

          {isChecking ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-3"></div>
              <p className="text-gray-400">Verificando dispositivos...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Setting */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${videoEnabled ? 'bg-blue-500' : 'bg-gray-600'}`}>
                    {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                  </div>
                  <div>
                    <h3 className="font-medium">Cámara</h3>
                    <p className="text-sm text-gray-400">
                      {hasCamera 
                        ? (videoEnabled ? 'Video activado' : 'Video desactivado')
                        : 'No se detectó cámara'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  disabled={!hasCamera}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    videoEnabled ? 'bg-blue-500' : 'bg-gray-600'
                  } ${!hasCamera ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    videoEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Audio Setting */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${audioEnabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                    {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                  </div>
                  <div>
                    <h3 className="font-medium">Micrófono</h3>
                    <p className="text-sm text-gray-400">
                      {hasMicrophone 
                        ? (audioEnabled ? 'Audio activado' : 'Audio desactivado')
                        : 'No se detectó micrófono'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  disabled={!hasMicrophone}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    audioEnabled ? 'bg-green-500' : 'bg-gray-600'
                  } ${!hasMicrophone ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    audioEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  <strong>💡 Consejo:</strong> Puedes unirte a la llamada sin cámara ni micrófono. 
                  Podrás activarlos durante la llamada si lo deseas.
                </p>
              </div>

              {!hasCamera && !hasMicrophone && (
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3">
                  <p className="text-sm text-yellow-300">
                    <strong>⚠️ Aviso:</strong> No se detectaron dispositivos de audio/video. 
                    La llamada será solo de texto/chat.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleStartCall}
              disabled={isChecking}
              className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone size={18} />
              Iniciar llamada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallSettingsModal;
