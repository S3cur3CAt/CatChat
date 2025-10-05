import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useVideoCallStore } from "../store/useVideoCallStore";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff, Maximize2, Minimize2 } from "lucide-react";
import ScreenShareSelector from "../components/ScreenShareSelector";

const VideoCallPage = ({ onClose }) => {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  
  const {
    localStream,
    remoteStream,
    screenStream,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    endCall,
    toggleVideo,
    toggleAudio,
    stopScreenShare
  } = useVideoCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScreenShareSelector, setShowScreenShareSelector] = useState(false);
  
  // Detectar si el stream remoto es pantalla compartida
  const isRemoteScreenShare = remoteStream && remoteStream.getVideoTracks().some(track => 
    track.label && (track.label.includes('screen') || track.label.includes('window') || track.label.includes('tab'))
  );

  // Configurar streams de video
  useEffect(() => {
    if (localVideoRef.current) {
      // Si se está compartiendo pantalla, mostrar screenStream, sino localStream
      const streamToShow = isScreenSharing && screenStream ? screenStream : localStream;
      localVideoRef.current.srcObject = streamToShow;
    }
  }, [localStream, screenStream, isScreenSharing]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    endCall();
    onClose?.();
  };

  const handleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      setShowScreenShareSelector(true);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!selectedUser) {
    return null;
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-gray-900 flex flex-col`}>
      {/* Video area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Remote video (main) */}
        <div className={`w-full h-full relative ${isRemoteScreenShare ? 'bg-black' : 'bg-gray-800'} flex items-center justify-center`}>
          {remoteStream && isConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full ${isRemoteScreenShare ? 'object-contain' : 'object-cover'}`}
            />
          ) : (
            <div className="text-center text-white">
              <div className="avatar mb-4">
                <div className="w-32 h-32 rounded-full ring ring-blue-500 ring-offset-4 ring-offset-gray-900">
                  <img 
                    src={selectedUser.profilePic || "/avatar.png"} 
                    alt={selectedUser.fullName}
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{selectedUser.fullName}</h2>
              <p className="text-gray-400">
                {isConnected ? "Video deshabilitado" : "Conectando..."}
              </p>
              {!isConnected && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                </div>
              )}
            </div>
          )}

          {/* Connection status indicator */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {isConnected ? 'Conectado' : 'Conectando...'}
            </div>
            {isRemoteScreenShare && (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                📺 Recibiendo pantalla compartida
              </div>
            )}
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <Minimize2 size={20} className="text-white" />
            ) : (
              <Maximize2 size={20} className="text-white" />
            )}
          </button>
        </div>

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-20 right-4 w-48 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
          {(localStream && isVideoEnabled) || (isScreenSharing && screenStream) ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isScreenSharing ? '' : 'transform scale-x-[-1]'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2">
                  <img 
                    src={authUser?.profilePic || "/avatar.png"} 
                    alt="Tú"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <p className="text-xs text-gray-400">Tú</p>
              </div>
            </div>
          )}
          
          {/* Local video status indicators */}
          <div className="absolute top-2 left-2 flex gap-1">
            {!isVideoEnabled && (
              <div className="bg-red-500 rounded-full p-1">
                <VideoOff size={12} className="text-white" />
              </div>
            )}
            {!isAudioEnabled && (
              <div className="bg-red-500 rounded-full p-1">
                <MicOff size={12} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800/90 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all duration-200 ${
              isVideoEnabled
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={isVideoEnabled ? "Desactivar video" : "Activar video"}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-all duration-200 ${
              isAudioEnabled
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            title={isAudioEnabled ? "Silenciar" : "Activar micrófono"}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Screen share toggle */}
          <button
            onClick={handleScreenShare}
            className={`p-3 rounded-full transition-all duration-200 ${
              isScreenSharing
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-600 hover:bg-gray-500 text-white"
            }`}
            title={isScreenSharing ? "Detener compartir pantalla" : "Compartir pantalla"}
          >
            {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
          </button>

          {/* End call */}
          <button
            onClick={handleEndCall}
            className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-200 text-white"
            title="Finalizar llamada"
          >
            <PhoneOff size={20} />
          </button>
        </div>

        {/* Call info */}
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-400">
            Llamada con <span className="text-white font-medium">{selectedUser.fullName}</span>
            {isScreenSharing && (
              <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                Compartiendo pantalla
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Screen Share Selector Modal */}
      <ScreenShareSelector
        isOpen={showScreenShareSelector}
        onClose={() => setShowScreenShareSelector(false)}
      />
    </div>
  );
};

export default VideoCallPage;
