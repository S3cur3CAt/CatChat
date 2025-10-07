import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useSupabaseVideoCallStore } from '../store/useSupabaseVideoCallStore';
import { motion, AnimatePresence } from 'framer-motion';

const SupabaseVideoCallModal = () => {
  const {
    isIncomingCall,
    caller,
    callType,
    acceptCall,
    rejectCall
  } = useSupabaseVideoCallStore();

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isIncomingCall && caller) {
      setShowModal(true);
      // Reproducir sonido de llamada entrante
      const audio = new Audio('/notification.mp3');
      audio.loop = true;
      audio.play().catch(e => console.log('No se pudo reproducir sonido:', e));
      
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    } else {
      setShowModal(false);
    }
  }, [isIncomingCall, caller]);

  const handleAccept = async () => {
    await acceptCall();
    setShowModal(false);
  };

  const handleReject = async () => {
    await rejectCall();
    setShowModal(false);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-[2px] rounded-3xl shadow-2xl"
          >
            <div className="bg-gray-900 rounded-3xl p-8 max-w-md relative overflow-hidden">
              {/* Patrón decorativo de fondo */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                {/* Avatar del caller con animación de pulso */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="relative"
                  >
                    <img
                      src={caller?.profilePic || '/avatar.png'}
                      alt={caller?.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1.6],
                        opacity: [0.5, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      className="absolute inset-0 rounded-full border-4 border-white/40"
                    />
                  </motion.div>
                </div>

                {/* Información de la llamada */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {caller?.fullName || 'Usuario'}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gray-300">
                    {callType === 'video' ? (
                      <>
                        <Video className="w-5 h-5" />
                        <span>Videollamada entrante...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5" />
                        <span>Llamada de voz entrante...</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-center gap-6">
                  {/* Botón rechazar */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReject}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="relative bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-all duration-300 shadow-lg">
                      <PhoneOff className="w-8 h-8" />
                    </div>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      className="absolute inset-0 rounded-full border-2 border-red-400/50"
                    />
                  </motion.button>

                  {/* Botón aceptar */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAccept}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-all duration-300 shadow-lg">
                      {callType === 'video' ? (
                        <Video className="w-8 h-8" />
                      ) : (
                        <Phone className="w-8 h-8" />
                      )}
                    </div>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      className="absolute inset-0 rounded-full border-2 border-green-400/50"
                    />
                  </motion.button>
                </div>

                {/* Texto de ayuda */}
                <div className="text-center mt-6 text-sm text-gray-400">
                  <p>Presiona el botón verde para aceptar</p>
                  <p>o el rojo para rechazar</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupabaseVideoCallModal;
