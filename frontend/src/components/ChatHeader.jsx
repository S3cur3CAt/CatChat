import { X, Video } from "lucide-react";
import { useRealtimeStore } from "../store/useRealtimeStore";
import { useChatStore } from "../store/useChatStore";
import { useVideoCallStore } from "../store/useVideoCallStore";
import CallSettingsModal from "./CallSettingsModal";
import UpdateNotification from "./UpdateNotification";
import { useState, useEffect } from "react";

const ChatHeader = ({ onVideoCall }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, refreshOnlineUsers } = useRealtimeStore();
  const { initiateCall, isCallActive } = useVideoCallStore();
  const [showCallSettings, setShowCallSettings] = useState(false);

  const selectedUserId = selectedUser?._id ?? selectedUser?.id;
  const isOnline = selectedUserId ? onlineUsers.includes(selectedUserId) : false;
  
  // Log para debugging
  useEffect(() => {
    console.log('👤 Estado del usuario seleccionado:', {
      nombre: selectedUser?.fullName,
      id: selectedUserId,
      estaOnline: isOnline,
      usuariosOnline: onlineUsers
    });
  }, [isOnline, selectedUserId, onlineUsers, selectedUser]);

  // Actualizar lista de usuarios online cuando cambia el usuario seleccionado
  useEffect(() => {
    if (selectedUser) {
      // Actualizar inmediatamente
      refreshOnlineUsers();
      console.log('🔄 Actualizando lista de usuarios online para:', selectedUser.fullName);
      
      // Configurar actualización periódica cada 5 segundos mientras el chat está abierto
      const intervalId = setInterval(() => {
        refreshOnlineUsers();
        console.log('⏱️ Actualización periódica de usuarios online');
      }, 5000); // Reducido a 5 segundos para mejor reactividad
      
      // Limpiar intervalo cuando cambie el usuario o se desmonte el componente
      return () => {
        clearInterval(intervalId);
        console.log('🧹 Intervalo de actualización limpiado');
      };
    }
  }, [selectedUser, refreshOnlineUsers]);

  const handleVideoCall = async () => {
    console.log('🎬 ChatHeader - Botón de videollamada presionado');
    console.log('🎬 Usuario seleccionado:', selectedUser);
    console.log('🎬 Llamada activa:', isCallActive);
    
    if (isCallActive) {
      // Si ya hay una llamada activa, abrir la interfaz
      console.log('🎬 Abriendo interfaz de llamada activa');
      if (onVideoCall) {
        onVideoCall();
      }
    } else {
      // Mostrar modal de configuración de llamada
      console.log('🎬 Mostrando configuración de llamada...');
      setShowCallSettings(true);
    }
  };

  const handleStartCall = async (settings) => {
    console.log('🎬 Iniciando llamada con configuración:', settings);
    
    // Pasar la configuración al store
    await initiateCall(selectedUser, 'video', settings);
    
    if (onVideoCall) {
      onVideoCall();
    }
  };



  return (
    <div className="relative">
      {/* Update Notification - se muestra arriba del header */}
      <UpdateNotification />
      
      {/* Header principal */}
      <div className="px-2.5 py-2 border-b border-base-300 flex-shrink-0 bg-base-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar">
              <div className="relative inline-block">
                <div className="size-10 rounded-full overflow-hidden">
                  <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-base-100 ${
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleVideoCall}
              className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary hover:bg-base-200"
              title="Start video call"
            >
              <Video size={20} />
            </button>


            <button
              onClick={() => setSelectedUser(null)}
              className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-red-500 hover:bg-red-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Call Settings Modal */}
        <CallSettingsModal
          isOpen={showCallSettings}
          onClose={() => setShowCallSettings(false)}
          onStartCall={handleStartCall}
          receiverName={selectedUser?.fullName || selectedUser?.username || 'Usuario'}
        />
      </div>
    </div>
  );
};

export default ChatHeader;
