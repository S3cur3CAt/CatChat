import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore"; // Importación faltante
import { useVideoCallStore } from "../store/useVideoCallStore";
import { useMessageStyleStore } from "../store/useMessageStyleStore";
import { useMessageHoverBackgroundStore } from "../store/useMessageHoverBackgroundStore";
import { useChatBackgroundStore } from "../store/useChatBackgroundStore";
import { formatMessageTime } from "../lib/utils";
import { Trash2, X } from "lucide-react";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import VideoCallPage from "../pages/VideoCallPage";
import VideoCallModal from "./VideoCallModal";

const ChatContainer = () => {
  const {
    messages = [], // Default to empty array
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    loadMoreMessages,
    paginationInfo = { currentPage: 1, totalPages: 1 }, // Default pagination
    deleteMessage
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  
  const {
    isCallActive,
    subscribeToVideoCallEvents,
    unsubscribeFromVideoCallEvents
  } = useVideoCallStore();

  const { getMessageStyle } = useMessageStyleStore();
  const { selectedHoverBackground } = useMessageHoverBackgroundStore();
  const { selectedChatBackground } = useChatBackgroundStore();
  
  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, message: null });
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  
  // Generar partículas del fondo del chat una sola vez
  const chatBackgroundParticles = useMemo(() => {
    const particles = {
      fireflies: [...Array(30)].map(() => ({
        left: Math.random() * 95 + 2.5, // Distribuir entre 2.5% y 97.5%
        top: Math.random() * 95 + 2.5,
        colorOffset: Math.random() * 30,
        duration: 8 + Math.random() * 4,
        delay: Math.random() * 5
      })),
      matrix: [...Array(30)].map(() => ({
        left: Math.random() * 98 + 1, // Distribuir aleatoriamente en todo el ancho
        duration: 5 + Math.random() * 3,
        delay: Math.random() * 5,
        topOffset: Math.random() * 100 // Offset inicial para la caída
      })),
      nebula: [...Array(40)].map((_, i) => {
        const colors = ['purple', 'pink', 'blue', 'cyan', 'violet'];
        return {
          left: Math.random() * 95 + 2.5,
          top: Math.random() * 95 + 2.5,
          size: 2 + Math.random() * 3,
          color: colors[i % colors.length],
          shadowSize: 8 + Math.random() * 8,
          duration: 10 + Math.random() * 5,
          delay: Math.random() * 5,
          direction: i % 2 === 0 ? 'normal' : 'reverse'
        };
      }),
      snow: [...Array(50)].map(() => ({
        left: Math.random() * 98 + 1, // Distribuir en todo el ancho
        size: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.3,
        shadowSize: 3 + Math.random() * 3,
        duration: 8 + Math.random() * 7,
        delay: Math.random() * 8
      })),
      ember: [...Array(35)].map(() => ({
        left: Math.random() * 96 + 2, // Distribuir en casi todo el ancho
        size: 2 + Math.random() * 2,
        height: 3 + Math.random() * 2,
        colorOffset: Math.random() * 55,
        shadowSize: 5 + Math.random() * 5,
        duration: 5 + Math.random() * 3,
        delay: Math.random() * 5
      })),
      galaxy: [...Array(70)].map((_, i) => ({
        left: Math.random() * 98 + 1,
        top: Math.random() * 98 + 1,
        size: 1 + Math.random() * 2,
        type: i % 3,
        opacity: 0.3 + Math.random() * 0.4,
        shadowSize: 2 + Math.random() * 3,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3
      })),
      quantum: [...Array(45)].map(() => ({
        left: Math.random() * 96 + 2,
        top: Math.random() * 96 + 2,
        r: 100 + Math.random() * 155,
        g: 100 + Math.random() * 155,
        shadowSize: 3 + Math.random() * 5,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2
      })),
      crystal: [...Array(25)].map(() => ({
        left: Math.random() * 94 + 3,
        top: Math.random() * 94 + 3,
        size: 8 + Math.random() * 6,
        duration: 5 + Math.random() * 3,
        delay: Math.random() * 5
      }))
    };
    return particles;
  }, []); // Solo se genera una vez cuando se monta ChatContainer

  // Generar partículas de hover una sola vez a nivel global
  const globalParticleData = useMemo(() => {
    const particles = {
      fireflies: [...Array(12)].map((_, i) => ({
        size: 2 + Math.random() * 4,
        left: 10 + (i * 7.5),
        top: 20 + Math.sin(i) * 30,
        colorOffset: i * 5,
        duration: 3 + i * 0.3,
        delay: i * 0.2
      })),
      nebula: [...Array(20)].map((_, i) => {
        const colors = ['purple', 'pink', 'blue', 'cyan', 'violet'];
        const color = colors[i % colors.length];
        return {
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: 1 + Math.random() * 3,
          color,
          duration: 8 + i * 0.5,
          delay: i * 0.15
        };
      }),
      matrix: [...Array(15)].map((_, i) => ({
        left: 5 + i * 6.5,
        opacity: 0.4 + Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        delay: i * 0.2
      })),
      snow: [...Array(25)].map(() => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        opacity: 0.4 + Math.random() * 0.4,
        duration: 5 + Math.random() * 5,
        delay: Math.random() * 5
      })),
      ember: [...Array(18)].map(() => ({
        left: 10 + Math.random() * 80,
        size: 1 + Math.random() * 3,
        colorOffset: Math.random() * 55,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 3
      })),
      galaxy: [...Array(30)].map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 0.5 + Math.random() * 2,
        colorIndex: i % 5,
        duration: 10 + Math.random() * 10,
        delay: i * 0.1
      })),
      quantum: [...Array(16)].map((_, i) => ({
        x: (i % 4) * 25 + 12.5,
        y: Math.floor(i / 4) * 25 + 12.5,
        duration: 1 + Math.random(),
        delay: i * 0.1
      }))
    };
    return particles;
  }, []); // Solo se genera una vez cuando se monta ChatContainer

  useEffect(() => {
    getMessages(selectedUser._id);
    if (subscribeToMessages) subscribeToMessages();
    return () => {
      if (unsubscribeFromMessages) unsubscribeFromMessages();
    };
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Suscribirse a eventos de videollamada una sola vez
  useEffect(() => {
    console.log('🔌 ChatContainer - Suscribiéndose a eventos de videollamada');
    console.log('🔌 ChatContainer - subscribeToVideoCallEvents function:', typeof subscribeToVideoCallEvents);
    subscribeToVideoCallEvents();
    return () => {
      console.log('🔌 ChatContainer - Desuscribiéndose de eventos de videollamada');
      unsubscribeFromVideoCallEvents();
    };
  }, [subscribeToVideoCallEvents, unsubscribeFromVideoCallEvents]);

  const handleScroll = useCallback(async () => {
    const container = chatContainerRef.current;
    if (!container || isLoadingMore || !hasMoreMessages) return;

    // Si el usuario ha hecho scroll hacia arriba (cerca del principio)
    if (container.scrollTop < 100) {
      setIsLoadingMore(true);
      try {
        const nextPage = paginationInfo.currentPage + 1;
        const result = await loadMoreMessages(selectedUser._id, nextPage);
        
        if (result && result.messages.length > 0) {
          // Agregar los mensajes más antiguos al principio del array
          const { messages } = useChatStore.getState();
          useChatStore.setState({ messages: [...result.messages, ...messages] });
        } else {
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error('Error loading more messages:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [selectedUser._id, paginationInfo.currentPage, isLoadingMore, hasMoreMessages, loadMoreMessages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (messageEndRef.current && messages && (isVideoCallOpen || !isVideoCallOpen)) {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [messages, isVideoCallOpen]);

  // Abrir automáticamente la videollamada cuando hay una llamada activa
  useEffect(() => {
    if (isCallActive && !isVideoCallOpen) {
      setIsVideoCallOpen(true);
    }
  }, [isCallActive, isVideoCallOpen]);

  // Componente Modal de Confirmación de Eliminación
  const DeleteMessageModal = () => {
    if (!deleteModal.isOpen) return null;

    const handleConfirmDelete = async () => {
      try {
        await deleteMessage(deleteModal.message.id);
        setDeleteModal({ isOpen: false, message: null });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    };

    const handleCancel = () => {
      setDeleteModal({ isOpen: false, message: null });
    };

    const messageUser = deleteModal.message.sender_id === authUser._id ? authUser : selectedUser;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Eliminar mensaje</h2>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-300 mb-4">
              ¿Seguro que quieres eliminar este mensaje?
            </p>

            {/* Message Preview */}
            <div className="bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={messageUser.profilePic || "/avatar.png"}
                    alt={`${messageUser.fullName || messageUser.username}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-white">
                      {messageUser.fullName || messageUser.username}
                    </span>
                    <time className="text-xs text-gray-400">
                      {formatMessageTime(deleteModal.message.created_at)}
                    </time>
                  </div>
                  <div className="space-y-2">
                    {deleteModal.message.image && (
                      <div className="max-w-xs">
                        <img
                          src={deleteModal.message.image}
                          alt="Attachment"
                          className="rounded border border-gray-600 max-w-full h-auto"
                        />
                      </div>
                    )}
                    {deleteModal.message.text && (
                      <div className="text-sm text-gray-200 break-words">
                        {deleteModal.message.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-300">
                <strong>CONSEJO:</strong> Puedes mantener pulsado <strong>Mayús</strong> cuando hagas clic en <strong>eliminar mensaje</strong> para ignorar esta confirmación por completo.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-700">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Función optimizada para determinar si mostrar avatar (sin logs excesivos)
  const shouldShowAvatar = useCallback((currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    if (currentMessage.sender_id !== previousMessage.sender_id) return true;
    
    const currentTime = new Date(currentMessage.created_at);
    const previousTime = new Date(previousMessage.created_at);
    const timeDiff = (currentTime - previousTime) / (1000 * 60);
    
    return timeDiff > 5;
  }, []);

  // Componente para renderizar un mensaje individual
  const Message = ({ message, index, showAvatar, particleData }) => {
    const isOwnMessage = message.sender_id === authUser._id;
    const user = isOwnMessage ? authUser : selectedUser;
    const isOptimistic = message.isOptimistic;

    const handleDeleteMessage = async (event) => {
      // Si se mantiene presionado Shift, eliminar directamente sin confirmación
      if (event.shiftKey) {
        try {
          await deleteMessage(message.id);
        } catch (error) {
          console.error('Error deleting message:', error);
        }
      } else {
        // Mostrar modal de confirmación
        setDeleteModal({ isOpen: true, message });
      }
    };

    return (
      <div
        className={`group relative flex items-start gap-3 px-4 py-2 transition-all duration-150 ${
          showAvatar ? 'mt-4' : 'mt-1'
        } ${isOptimistic ? 'opacity-70' : ''}`}
        ref={index === messages.length - 1 ? messageEndRef : null}
        onMouseEnter={() => setHoveredMessageId(message._id || message.id || `msg-${index}`)}
        onMouseLeave={() => setHoveredMessageId(null)}
      >
        {/* Simple Hover Background when no animation selected */}
        {selectedHoverBackground === 'none' && hoveredMessageId === (message._id || message.id || `msg-${index}`) && (
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg bg-base-300/10"
            style={{
              transition: 'opacity 0.2s ease-in-out',
              zIndex: 1
            }}
          />
        )}

        {/* Animated Hover Background - Always mounted, opacity controlled */}
        {selectedHoverBackground !== 'none' && (
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
          style={{
            opacity: hoveredMessageId === (message._id || message.id || `msg-${index}`) ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1
          }}
        >
          {/* Fireflies - Glowing golden particles */}
          {selectedHoverBackground === 'fireflies' && (
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-b from-amber-950/5 to-orange-950/10">
              {particleData.fireflies.map((particle, i) => (
                <div key={i} className="absolute rounded-full" style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: `radial-gradient(circle, rgba(255, ${180 + particle.colorOffset}, 0, 0.9) 0%, rgba(255, ${200 + particle.colorOffset * 0.6}, 50, 0) 60%)`,
                  boxShadow: `0 0 ${10 + particle.size * 2}px rgba(255, ${180 + particle.colorOffset}, 0, 0.6)`,
                  animationName: 'floatFirefly',
                  animationDuration: `${particle.duration}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${particle.delay}s`
                }}/>
              ))}
            </div>
          )}
          {/* Nebula Particles - Cosmic colorful dust */}
          {selectedHoverBackground === 'nebula' && (
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-950/10 via-pink-950/10 to-blue-950/10">
              {particleData.nebula.map((particle, i) => {
                const colorMap = {
                  'purple': { bg: 'rgba(147, 51, 234, 0.8)', shadow: 'rgba(147, 51, 234, 0.6)' },
                  'pink': { bg: 'rgba(236, 72, 153, 0.8)', shadow: 'rgba(236, 72, 153, 0.6)' },
                  'blue': { bg: 'rgba(59, 130, 246, 0.8)', shadow: 'rgba(59, 130, 246, 0.6)' },
                  'cyan': { bg: 'rgba(6, 182, 212, 0.8)', shadow: 'rgba(6, 182, 212, 0.6)' },
                  'violet': { bg: 'rgba(139, 92, 246, 0.8)', shadow: 'rgba(139, 92, 246, 0.6)' }
                };
                const colors = colorMap[particle.color] || colorMap['violet'];
                return (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    background: colors.bg,
                    boxShadow: `0 0 ${8 + particle.size * 3}px ${colors.shadow}`,
                    animationName: 'nebulaFloat',
                    animationDuration: `${particle.duration}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDelay: `${particle.delay}s`
                  }}/>
                );
              })}
            </div>
          )}
          
          {/* Matrix Rain - Digital rain particles */}
          {selectedHoverBackground === 'matrix' && (
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-black/10">
              {particleData.matrix.map((particle, i) => (
                <div key={i} className="absolute" style={{
                  left: `${particle.left}%`,
                  width: '2px',
                  height: '100%'
                }}>
                  <div className="absolute w-full" style={{
                    height: '12px',
                    top: '0%',
                    background: `linear-gradient(to bottom, transparent, rgba(0, 255, 0, ${particle.opacity}), transparent)`,
                    boxShadow: `0 0 8px rgba(0, 255, 0, 0.6)`,
                    animationName: 'matrixFall',
                    animationDuration: `${particle.duration}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDelay: `${particle.delay}s`
                  }}/>
                </div>
              ))}
            </div>
          )}

          {/* Snow Fall - Winter particles */}
          {selectedHoverBackground === 'snow' && (
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              {particleData.snow.map((particle, i) => (
                <div key={i} className="absolute rounded-full bg-white" style={{
                  left: `${particle.left}%`,
                  top: '-10px',
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity,
                  boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.5)`,
                  animationName: 'snowFall',
                  animationDuration: `${particle.duration}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  animationDelay: `${particle.delay}s`
                }}/>
              ))}
            </div>
          )}

          {/* Ember Sparks - Fire particles */}
          {selectedHoverBackground === 'ember' && (
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-t from-red-950/20 to-transparent">
              {particleData.ember.map((particle, i) => (
                <div key={i} className="absolute rounded-full" style={{
                  left: `${particle.left}%`,
                  bottom: '0px',
                  width: `${particle.size}px`,
                  height: `${particle.size * 2}px`,
                  background: `radial-gradient(ellipse, rgba(255, ${100 + particle.colorOffset}, 0, 0.9), rgba(255, 0, 0, 0))`,
                  boxShadow: `0 0 ${6 + particle.size * 2}px rgba(255, ${100 + particle.colorOffset}, 0, 0.7)`,
                  animationName: 'emberRise',
                  animationDuration: `${particle.duration}s`,
                  animationTimingFunction: 'ease-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${particle.delay}s`
                }}/>
              ))}
            </div>
          )}

          {/* Galaxy Dust - Space particles */}
          {selectedHoverBackground === 'galaxy' && (
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-950/10 via-purple-950/10 to-pink-950/10">
              {particleData.galaxy.map((particle, i) => {
                const colors = [
                  'rgba(99, 102, 241, 0.9)',  // indigo
                  'rgba(168, 85, 247, 0.9)',  // purple
                  'rgba(236, 72, 153, 0.9)',  // pink
                  'rgba(59, 130, 246, 0.9)',  // blue
                  'rgba(147, 197, 253, 0.9)'  // light blue
                ];
                const color = colors[particle.colorIndex];
                return (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    background: color,
                    boxShadow: `0 0 ${4 + particle.size * 2}px ${color}`,
                    animationName: 'galaxyDrift',
                    animationDuration: `${particle.duration}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${particle.delay}s`
                  }}/>
                );
              })}
            </div>
          )}

          {/* Quantum Dots - Quantum particles */}
          {selectedHoverBackground === 'quantum' && (
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-slate-950/5">
              {particleData.quantum.map((particle, i) => (
                <div key={i} className="absolute" style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: '3px',
                  height: '3px',
                  transform: 'translate(-50%, -50%)'
                }}>
                  <div className="absolute w-full h-full rounded-full" style={{
                    background: 'rgba(0, 255, 255, 0.8)',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
                    animationName: 'quantumBlink',
                    animationDuration: `${particle.duration}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${particle.delay}s`
                  }}/>
                  {i % 3 === 0 && (
                    <div className="absolute w-full h-full rounded-full" style={{
                      background: 'rgba(255, 0, 255, 0.6)',
                      boxShadow: '0 0 15px rgba(255, 0, 255, 0.6)',
                      animationName: 'quantumJump',
                      animationDuration: '2.5s',
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDelay: `${particle.delay + 0.5}s`
                    }}/>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Crystal Shards - Crystal particles */}
          {selectedHoverBackground === 'crystal' && (
            <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-950/5 via-cyan-950/5 to-teal-950/5">
              {[...Array(14)].map((_, i) => {
                const size = 3 + Math.random() * 5;
                const rotation = Math.random() * 360;
                return (
                  <div key={i} className="absolute" style={{
                    left: `${10 + (i * 6)}%`,
                    top: `${20 + Math.sin(i * 0.5) * 30}%`,
                    width: `${size}px`,
                    height: `${size * 1.5}px`,
                    transform: `rotate(${rotation}deg)`,
                    background: `linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.6), rgba(147, 197, 253, 0.9))`,
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                    boxShadow: `0 0 ${10 + size}px rgba(6, 182, 212, 0.5)`,
                    animationName: 'crystalFloat',
                    animationDuration: `${4 + i * 0.2}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${index * 0.1 + i * 0.2}s`
                  }}/>
                );
              })}
            </div>
          )}
        </div>
        )}
        
        {/* Barra de acciones optimizada - aparece en hover */}
        {!isOptimistic && (
          <div className="absolute -top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
            <div className="flex items-center bg-gray-800 rounded-lg shadow-lg border border-gray-700 px-1 py-1 gap-0.5">
              <button
                className="hover:bg-gray-700 rounded p-1.5 transition-colors duration-150"
                title="Añadir reacción"
              >
                <span className="text-sm">😀</span>
              </button>
              <button
                className="hover:bg-gray-700 rounded p-1.5 transition-colors duration-150"
                title="Responder mensaje"
              >
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                className="hover:bg-gray-700 rounded p-1.5 transition-colors duration-150"
                title="Reenviar mensaje"
              >
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
              {/* Botón de eliminar - solo para mensajes propios */}
              {isOwnMessage && (
                <button
                  onClick={handleDeleteMessage}
                  className="hover:bg-red-600 rounded p-1.5 transition-colors"
                  title="Eliminar mensaje (Shift+click para eliminar sin confirmación)"
                >
                  <Trash2 size={16} className="text-gray-300 hover:text-white" />
                </button>
              )}
              <button
                className="hover:bg-gray-700 rounded p-1.5 transition-colors"
                title="Más opciones"
              >
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Avatar - solo se muestra cuando showAvatar es true */}
        <div className="flex-shrink-0 w-10 h-10 relative z-10">
          {showAvatar ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-base-300">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={`${user.fullName || user.username}'s avatar`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <time className="text-xs text-base-content/50">
                {new Date(message.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </time>
            </div>
          )}
        </div>

        {/* Contenido del mensaje */}
        <div className="flex-1 min-w-0 relative z-10">
          {/* Header del mensaje - solo cuando se muestra avatar */}
          {showAvatar && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-base-content hover:underline cursor-pointer">
                {isOwnMessage ? 'Tú' : (user.fullName || user.username)}
              </span>
              <time className="text-xs text-base-content/50">
                {formatMessageTime(message.created_at)}
              </time>
            </div>
          )}

          {/* Contenido */}
          <div className="space-y-2">
            {/* Imagen si existe */}
            {message.image && (
              <div className="max-w-sm">
                <img
                  src={message.image}
                  alt="Attachment"
                  className="rounded-lg border border-base-300 max-w-full h-auto cursor-pointer hover:shadow-lg transition-shadow"
                />
              </div>
            )}
            
            {/* Texto del mensaje */}
            {message.text && (
              <div 
                className="leading-relaxed break-words rounded-xl p-3 shadow-sm transition-all duration-200 inline-block max-w-md"
                style={getMessageStyle(isOwnMessage ? 'sent' : 'received')}
              >
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-transparent">
      {/* Animated Background Layer */}
      {selectedChatBackground !== 'none' && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {selectedChatBackground === 'fireflies' && (
            <div className="w-full h-full bg-gradient-to-b from-amber-950/5 to-orange-950/10">
              {chatBackgroundParticles.fireflies.map((particle, i) => (
                <div key={i} className="absolute rounded-full" style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: '4px',
                  height: '4px',
                  background: `radial-gradient(circle, rgba(255, ${170 + particle.colorOffset}, 0, 0.7) 0%, transparent 70%)`,
                  boxShadow: `0 0 15px rgba(255, ${170 + particle.colorOffset}, 0, 0.5)`,
                  animationName: 'floatFirefly',
                  animationDuration: `${particle.duration}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${particle.delay}s`
                }}/>
              ))}
            </div>
          )}
          {selectedChatBackground === 'matrix' && (
            <div className="w-full h-full bg-black/5">
              {chatBackgroundParticles.matrix.map((particle, i) => (
                <div key={i} className="absolute" style={{
                  left: `${particle.left}%`,
                  width: '2px',
                  height: '100%'
                }}>
                  <div className="absolute w-full" style={{
                    height: '15px',
                    top: `${-particle.topOffset}%`,
                    background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 0, 0.3), transparent)',
                    boxShadow: '0 0 6px rgba(0, 255, 0, 0.2)',
                    animationName: 'matrixFallBackground',
                    animationDuration: `${particle.duration}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDelay: `${particle.delay}s`
                  }}/>
                </div>
              ))}
            </div>
          )}
          {selectedChatBackground === 'nebula' && (
            <div className="w-full h-full bg-gradient-to-br from-purple-950/5 via-pink-950/5 to-blue-950/5">
              {chatBackgroundParticles.nebula.map((particle, i) => {
                const colorMap = {
                  purple: '168, 85, 247',
                  pink: '236, 72, 153',
                  blue: '59, 130, 246',
                  cyan: '34, 211, 238',
                  violet: '139, 92, 246'
                };
                return (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    background: `radial-gradient(circle, rgba(${colorMap[particle.color]}, 0.4), transparent)`,
                    boxShadow: `0 0 ${particle.shadowSize}px rgba(${colorMap[particle.color]}, 0.3)`,
                    animationName: 'nebulaFloat',
                    animationDuration: `${particle.duration}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${particle.delay}s`,
                    animationDirection: particle.direction
                  }}/>
                );
              })}
            </div>
          )}
          {selectedChatBackground === 'snow' && (
            <div className="w-full h-full">
              {chatBackgroundParticles.snow.map((particle, i) => (
                <div key={i} className="absolute rounded-full bg-white" style={{
                  left: `${particle.left}%`,
                  top: '-10px',
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity,
                  boxShadow: `0 0 ${particle.shadowSize}px rgba(255, 255, 255, 0.4)`,
                  animationName: 'snowFall',
                  animationDuration: `${particle.duration}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  animationDelay: `${particle.delay}s`
                }}/>
              ))}
            </div>
          )}
          {selectedChatBackground === 'ember' && (
            <div className="w-full h-full bg-gradient-to-t from-red-950/10 to-transparent">
              {chatBackgroundParticles.ember.map((particle, i) => (
                <div key={i} className="absolute rounded-full" style={{
                  left: `${particle.left}%`,
                  bottom: '0px',
                  width: `${particle.size}px`,
                  height: `${particle.height}px`,
                  background: `radial-gradient(ellipse, rgba(255, ${100 + particle.colorOffset}, 0, 0.6), rgba(255, 0, 0, 0))`,
                  boxShadow: `0 0 ${particle.shadowSize}px rgba(255, ${100 + particle.colorOffset}, 0, 0.4)`,
                  animationName: 'emberRise',
                  animationDuration: `${particle.duration}s`,
                  animationTimingFunction: 'ease-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${particle.delay}s`
                }}/>
              ))}
            </div>
          )}
          {selectedChatBackground === 'galaxy' && (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950/5 via-purple-950/5 to-pink-950/5">
              {chatBackgroundParticles.galaxy.map((particle, i) => {
                const color = particle.type === 0 ? 'white' : particle.type === 1 ? '#a78bfa' : '#ec4899';
                return (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    background: color,
                    opacity: particle.opacity,
                    boxShadow: `0 0 ${particle.shadowSize}px ${color}`,
                    animationName: 'twinkle',
                    animationDuration: `${particle.duration}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${particle.delay}s`
                  }}/>
                );
              })}
            </div>
          )}
          {selectedChatBackground === 'quantum' && (
            <div className="w-full h-full bg-slate-950/5">
              {chatBackgroundParticles.quantum.map((particle, i) => (
                <div key={i} className="absolute rounded-full" style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: '2px',
                  height: '2px',
                  background: `rgba(${particle.r}, ${particle.g}, 255, 0.5)`,
                  boxShadow: `0 0 ${particle.shadowSize}px rgba(100, 150, 255, 0.3)`,
                  animationName: 'quantumPulse',
                  animationDuration: `${particle.duration}s`,
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: `${particle.delay}s`
                }}/>
              ))}
            </div>
          )}
          {selectedChatBackground === 'crystal' && (
            <div className="w-full h-full bg-gradient-to-br from-blue-950/5 via-cyan-950/5 to-teal-950/5">
              {chatBackgroundParticles.crystal.map((particle, i) => (
                <div key={i} className="absolute" style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: '0',
                  height: '0',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: `${particle.size}px solid rgba(34, 211, 238, 0.3)`,
                  filter: 'drop-shadow(0 0 3px rgba(34, 211, 238, 0.4))',
                  animationName: 'crystalRotate',
                  animationDuration: `${particle.duration}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  animationDelay: `${particle.delay}s`
                }}/>
              ))}
            </div>
          )}
        </div>
      )}

      <ChatHeader onVideoCall={() => setIsVideoCallOpen(true)} />

      {!isVideoCallOpen && (
        <>
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent" ref={chatContainerRef}>
              <div className="w-full flex flex-col min-h-full">
                {/* Spacer para empujar mensajes hacia abajo */}
                <div className="flex-1"></div>
                
                {/* Mensajes */}
                <div className="pb-4">
                  {messages.map((message, index) => {
                    const showAvatar = shouldShowAvatar(message, messages[index - 1]);
                    return (
                      <Message
                        key={message.id}
                        message={message}
                        index={index}
                        showAvatar={showAvatar}
                        particleData={globalParticleData}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-transparent">
            <MessageInput />
          </div>
        </>
      )}

      {/* Input siempre visible durante videollamada */}
      {isVideoCallOpen && (
        <div className="absolute bottom-0 left-0 right-0 bg-transparent">
          <MessageInput />
        </div>
      )}

      {/* Video Call Modal - parte superior */}
      {isVideoCallOpen && (
        <div className="absolute top-16 left-0 right-0 h-1/2 z-10 bg-base-100">
          <VideoCallPage onClose={() => setIsVideoCallOpen(false)} />
        </div>
      )}

      {/* Messages area - parte inferior durante videollamada */}
      {isVideoCallOpen && (
        <div className="absolute top-1/2 left-0 right-0 bottom-16 z-5 bg-base-200">
          <div className="h-full overflow-y-auto" ref={(el) => {
            if (el && isVideoCallOpen) {
              setTimeout(() => {
                el.scrollTop = el.scrollHeight;
              }, 100);
            }
          }}>
            <div className="w-full pb-4">
              {messages.slice(-20).map((message, index) => {
                const originalIndex = messages.length - 20 + index;
                const showAvatar = shouldShowAvatar(
                  message, 
                  originalIndex > 0 ? messages[originalIndex - 1] : null
                );
                return (
                  <Message
                    key={message.id}
                    message={message}
                    index={index}
                    showAvatar={showAvatar}
                    particleData={globalParticleData}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Modal */}
      <DeleteMessageModal />

      {/* Video Call Modal for incoming calls */}
      <VideoCallModal />
    </div>
  );
};

export default ChatContainer;