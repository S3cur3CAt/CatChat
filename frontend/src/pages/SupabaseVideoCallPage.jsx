import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Maximize2,
  Minimize2,
  Loader
} from 'lucide-react';
import { useSupabaseVideoCallStore } from '../store/useSupabaseVideoCallStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SupabaseVideoCallPage = () => {
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const {
    isCallActive,
    localStream,
    remoteStream,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    remoteUser,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    endCall
  } = useSupabaseVideoCallStore();

  // Configurar streams de video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Actualizar estado de conexión
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
      toast.success('Llamada conectada');
    } else if (isCallActive) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, isCallActive]);

  // Redirigir si no hay llamada activa
  useEffect(() => {
    if (!isCallActive) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCallActive, navigate]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = async () => {
    await endCall();
    toast.success('Llamada finalizada');
    navigate('/');
  };

  const handleToggleScreen = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
      toast.success('Compartir pantalla detenido');
    } else {
      await startScreenShare();
      toast.success('Compartiendo pantalla');
    }
  };

  if (!isCallActive) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      {/* Video remoto (pantalla completa) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <span className="text-4xl">
                {remoteUser?.fullName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <p className="text-xl mb-2">{remoteUser?.fullName || 'Usuario'}</p>
            <p className="text-sm text-gray-400">
              {connectionStatus === 'connecting' ? 'Conectando...' : 'Sin video'}
            </p>
          </div>
        )}
      </div>

      {/* Video local (Picture-in-Picture) */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700"
        draggable
      >
        {localStream && isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <VideoOff className="w-8 h-8 text-gray-500" />
          </div>
        )}
        
        {!isAudioEnabled && (
          <div className="absolute top-2 left-2 bg-red-500 rounded-full p-1">
            <MicOff className="w-4 h-4 text-white" />
          </div>
        )}
      </motion.div>

      {/* Información de estado */}
      <div className="absolute top-4 left-4 text-white">
        <AnimatePresence>
          {connectionStatus === 'connecting' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <Loader className="w-4 h-4 animate-spin" />
              <span>Conectando...</span>
            </motion.div>
          )}
          {connectionStatus === 'connected' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Conectado</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles de llamada */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="bg-gray-900/90 backdrop-blur-md rounded-full px-6 py-4 flex items-center gap-4 shadow-2xl border border-gray-700">
          {/* Botón de video */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isVideoEnabled ? 'Desactivar video' : 'Activar video'}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </motion.button>

          {/* Botón de audio */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isAudioEnabled ? 'Silenciar' : 'Activar micrófono'}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </motion.button>

          {/* Botón de compartir pantalla */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleScreen}
            className={`p-4 rounded-full transition-all ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isScreenSharing ? 'Dejar de compartir' : 'Compartir pantalla'}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </motion.button>

          {/* Botón de pantalla completa */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleFullscreen}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </motion.button>

          {/* Separador */}
          <div className="w-px h-12 bg-gray-600 mx-2"></div>

          {/* Botón de colgar */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg"
            title="Finalizar llamada"
          >
            <PhoneOff className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>

      {/* Indicador de pantalla compartida */}
      <AnimatePresence>
        {isScreenSharing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" />
            <span>Compartiendo pantalla</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupabaseVideoCallPage;
