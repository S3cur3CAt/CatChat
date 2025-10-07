import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useChatStore } from "./useChatStore";
import { useAuthStore } from "./useAuthStore";

export const useRealtimeStore = create((set, get) => ({
  onlineUsers: [],
  typingUsers: new Set(),
  subscriptions: [],
  currentUserId: null,
  presenceHandlers: {
    handleVisibilityChange: null,
    visibilityTimeout: null,
  },

  // Inicializar todas las suscripciones de Realtime
  initializeRealtime: async (userId) => {
    console.log('🔄 Inicializando Supabase Realtime para usuario:', userId);
    
    // Limpiar suscripciones anteriores
    get().cleanup();

    // Suscribirse a mensajes nuevos
    get().subscribeToMessages();
    
    // Suscribirse a estados online/offline
    get().subscribeToUserStatus();
    
    // Suscribirse a eventos de typing
    get().subscribeToTypingEvents(userId);

    get().setUserOnline(userId);

    // Configurar heartbeat para mantener usuario online
    get().setupHeartbeat(userId);

    set({ currentUserId: userId });
    get().setupPresenceListeners(userId);

    try {
      const { data, error } = await supabase
        .from('user_status')
        .select('user_id, last_seen, is_online')
        .eq('is_online', true);

      if (!error && Array.isArray(data)) {
        const now = Date.now();
        const ONLINE_THRESHOLD_MS = 60000; // 60 segundos para considerar usuario activo
        const activeUsers = data
          .filter(row => row.is_online && row.last_seen && now - new Date(row.last_seen).getTime() <= ONLINE_THRESHOLD_MS)
          .map(row => row.user_id);
        set({ onlineUsers: activeUsers });
      }
    } catch (err) {
      console.error('❌ Error cargando usuarios online iniciales:', err);
    }
  },

  // Suscribirse a mensajes nuevos
  subscribeToMessages: () => {
    console.log('📨 Suscribiéndose a mensajes en tiempo real');
    
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('📨 Nuevo mensaje recibido:', payload.new);
          
          // Agregar mensaje al store de chat
          const chatStore = useChatStore.getState();
          if (chatStore.addMessage) {
            chatStore.addMessage(payload.new);
          }
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('🗑️ Mensaje eliminado:', payload.old);

          const deletedMessage = payload?.old;
          if (!deletedMessage) return;

          const chatStoreState = useChatStore.getState();
          const { removeMessage } = chatStoreState;

          if (typeof removeMessage === 'function') {
            removeMessage(deletedMessage.id);
          }
        }
      )
      .subscribe();

    set(state => ({
      subscriptions: [...state.subscriptions, subscription]
    }));
  },

  // Suscribirse a estados de usuarios
  subscribeToUserStatus: () => {
    console.log('👥 Suscribiéndose a estados de usuarios');
    
    const subscription = supabase
      .channel('user_status')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_status' },
        (payload) => {
          console.log('👥 Cambio en estado de usuario:', payload);
          
          const { onlineUsers } = get();
          const now = Date.now();
          const ONLINE_THRESHOLD_MS = 60000; // 60 segundos para considerar usuario activo
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updatedUser = payload.new;
            
            // Si el usuario está marcado como offline, removerlo inmediatamente
            if (!updatedUser.is_online) {
              console.log(`❌ Usuario ${updatedUser.user_id} marcado como offline - removiendo de lista`);
              const newOnlineUsers = onlineUsers.filter(id => id !== updatedUser.user_id);
              set({ onlineUsers: newOnlineUsers });
              console.log('📊 Usuarios online actualizados:', newOnlineUsers);
              return;
            }
            
            // Verificar si el usuario está activo basado en last_seen
            const isActive = updatedUser.is_online && updatedUser.last_seen && (now - new Date(updatedUser.last_seen).getTime() <= ONLINE_THRESHOLD_MS);

            if (isActive) {
              // Agregar a lista de online si no está
              if (!onlineUsers.includes(updatedUser.user_id)) {
                console.log(`✅ Usuario ${updatedUser.user_id} marcado como online - agregando a lista`);
                const newOnlineUsers = [...onlineUsers, updatedUser.user_id];
                set({ onlineUsers: newOnlineUsers });
                console.log('📊 Usuarios online actualizados:', newOnlineUsers);
              }
            } else {
              // Remover de lista de online por inactividad
              console.log(`⏰ Usuario ${updatedUser.user_id} inactivo - removiendo de lista`);
              const newOnlineUsers = onlineUsers.filter(id => id !== updatedUser.user_id);
              set({ onlineUsers: newOnlineUsers });
              console.log('📊 Usuarios online actualizados:', newOnlineUsers);
            }
          } else if (payload.eventType === 'DELETE') {
            // Remover de lista de online
            console.log(`🗑️ Usuario ${payload.old.user_id} eliminado - removiendo de lista`);
            const newOnlineUsers = onlineUsers.filter(id => id !== payload.old.user_id);
            set({ onlineUsers: newOnlineUsers });
            console.log('📊 Usuarios online actualizados:', newOnlineUsers);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('👤 Cambio en perfiles:', payload);
          
          // Cuando se crea o actualiza un usuario
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const chatStore = useChatStore.getState();
            const authStore = useAuthStore.getState();
            
            // Recargar la lista de usuarios
            chatStore.getUsers();
            
            // Si el cambio es de otro usuario, actualizar su imagen en tiempo real
            if (payload.eventType === 'UPDATE' && payload.new) {
              const updatedUser = payload.new;
              console.log('🖼️ Actualizando imagen de perfil en tiempo real:', updatedUser.id);
              
              // Actualizar el usuario seleccionado si es el que cambió
              if (chatStore.selectedUser?.id === updatedUser.id) {
                chatStore.setSelectedUser({
                  ...chatStore.selectedUser,
                  profilePic: updatedUser.avatar_url,
                  fullName: updatedUser.full_name
                });
              }
              
              // Actualizar la lista de usuarios con la nueva imagen
              const updatedUsers = chatStore.users.map(user => {
                if (user.id === updatedUser.id) {
                  return {
                    ...user,
                    profilePic: updatedUser.avatar_url,
                    fullName: updatedUser.full_name
                  };
                }
                return user;
              });
              chatStore.setUsers(updatedUsers);
              
              // Si es el usuario actual, actualizar su información también
              if (authStore.authUser?.id === updatedUser.id) {
                authStore.setAuthUser({
                  ...authStore.authUser,
                  profilePic: updatedUser.avatar_url,
                  fullName: updatedUser.full_name
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Guardar suscripción
    set(state => ({
      subscriptions: [...state.subscriptions, subscription]
    }));
  },

  // Suscribirse a eventos de typing
  subscribeToTypingEvents: (userId) => {
    console.log('⌨️ Suscribiéndose a eventos de typing');
    
    const subscription = supabase
      .channel('typing_events')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'typing_events',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('⌨️ Evento de typing recibido:', payload);
          
          const { eventType, new: newRow, old: oldRow } = payload;

          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRow?.is_typing) {
            // Usuario empezó o volvió a escribir
            set(state => ({
              typingUsers: new Set([...state.typingUsers, newRow.sender_id])
            }));
          } else if ((eventType === 'UPDATE' && newRow && !newRow.is_typing) || eventType === 'DELETE') {
            // Evento expirado
            set(state => {
              const newTypingUsers = new Set(state.typingUsers);
              const senderId = eventType === 'DELETE' ? oldRow?.sender_id : newRow?.sender_id;
              if (senderId) {
                newTypingUsers.delete(senderId);
              }
              return { typingUsers: newTypingUsers };
            });
          }
        }
      )
      .subscribe();

    // Guardar suscripción
    set(state => ({
      subscriptions: [...state.subscriptions, subscription]
    }));
  },

  // Marcar usuario como online
  setUserOnline: async (userId) => {
    try {
      // Verificar que hay sesión activa antes de intentar
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('⚠️ No hay sesión activa, saltando setUserOnline');
        return;
      }

      const { error } = await supabase
        .from('user_status')
        .upsert({
          user_id: userId,
          is_online: true,
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Error marcando usuario como online:', error);
        // No lanzar error, solo registrar
      } else {
        console.log('✅ Usuario marcado como online:', userId);
      }
    } catch (error) {
      console.error('❌ Error en setUserOnline:', error);
      // No lanzar error, solo registrar
    }
  },

  // Marcar usuario como offline
  setUserOffline: async (userId) => {
    try {
      const { error } = await supabase
        .from('user_status')
        .upsert({
          user_id: userId,
          is_online: false,
          last_seen: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error marcando usuario como offline:', error);
      } else {
        console.log('❌ Usuario marcado como offline:', userId);
        // Actualizar lista local inmediatamente
        set((state) => ({
          onlineUsers: state.onlineUsers.filter((id) => id !== userId)
        }));
      }
    } catch (error) {
      console.error('❌ Error en setUserOffline:', error);
    }
  },

  // Remover usuario de la lista online de forma inmediata
  removeUserFromOnlineList: (userId) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId)
    }));
  },

  setupPresenceListeners: (userId) => {
    if (typeof document === "undefined") return;

    const clearExistingTimeout = () => {
      const { presenceHandlers } = get();
      if (presenceHandlers.visibilityTimeout) {
        clearTimeout(presenceHandlers.visibilityTimeout);
        set({
          presenceHandlers: {
            ...presenceHandlers,
            visibilityTimeout: null,
          },
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log('👀 Pestaña oculta: marcando usuario offline instantáneamente', userId);
        clearExistingTimeout();
        get().removeUserFromOnlineList(userId);
        get().setUserOffline(userId);
        get().refreshOnlineUsers();
      } else {
        clearExistingTimeout();
        get().setUserOnline(userId);
        get().refreshOnlineUsers();
      }
    };

    // Manejador para cuando se cierra la ventana
    const handleBeforeUnload = () => {
      console.log('🚪 Usuario cerrando ventana:', userId);
      
      // Marcar usuario como offline inmediatamente
      get().removeUserFromOnlineList(userId);
      get().setUserOffline(userId);
      
      // Usar sendBeacon para enviar señal de desconexión
      if (navigator.sendBeacon) {
        const url = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/users/offline`;
        const data = new Blob([JSON.stringify({ userId })], { type: 'application/json' });
        const sent = navigator.sendBeacon(url, data);
        console.log('📡 Beacon enviado:', sent ? 'Éxito' : 'Fallo', 'URL:', url);
      }
      
      // También intentar con fetch síncrono como fallback
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/users/offline`;
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
          keepalive: true, // Importante para que funcione al cerrar ventana
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error enviando señal de desconexión:', error);
      }

      get().refreshOnlineUsers();
    };

    // Manejador para cuando la página se descarga
    const handleUnload = () => {
      get().removeUserFromOnlineList(userId);
      get().setUserOffline(userId);
      get().refreshOnlineUsers();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    set(({ presenceHandlers }) => ({
      presenceHandlers: {
        ...presenceHandlers,
        handleVisibilityChange,
        handleBeforeUnload,
        handleUnload,
      },
    }));
  },

  // Configurar heartbeat para mantener usuario online
  setupHeartbeat: (userId) => {
    // Actualizar estado cada 20 segundos para mantener presencia activa
    const heartbeatInterval = setInterval(async () => {
      try {
        // Verificar que hay sesión activa antes de actualizar
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await get().setUserOnline(userId);
          console.log('💓 Heartbeat enviado para usuario:', userId);
          
          // También actualizar la lista de usuarios online
          await get().refreshOnlineUsers();
        }
      } catch (error) {
        console.error('❌ Error en heartbeat:', error);
      }
    }, 20000); // Cada 20 segundos

    // Guardar interval para limpieza posterior
    set({ heartbeatInterval });
  },

  // Refrescar lista de usuarios online
  refreshOnlineUsers: async () => {
    try {
      // Primero obtener TODOS los usuarios con su estado
      const { data, error } = await supabase
        .from('user_status')
        .select('user_id, last_seen, is_online');

      if (!error && Array.isArray(data)) {
        const now = Date.now();
        const ONLINE_THRESHOLD_MS = 60000; // 60 segundos para considerar usuario activo
        
        console.log('📊 Estados de usuarios en BD:', data.map(u => ({
          id: u.user_id,
          online: u.is_online,
          lastSeen: u.last_seen ? new Date(u.last_seen).toLocaleTimeString() : 'nunca',
          secsAgo: u.last_seen ? Math.round((now - new Date(u.last_seen).getTime()) / 1000) : 999
        })));
        
        const activeUsers = data
          .filter(row => {
            // Solo considerar online si is_online es true Y last_seen es reciente
            const isRecent = row.last_seen && 
                   (now - new Date(row.last_seen).getTime() <= ONLINE_THRESHOLD_MS);
            return row.is_online && isRecent;
          })
          .map(row => row.user_id);
        
        console.log('🔄 Usuarios considerados online:', activeUsers.length, activeUsers);
        set({ onlineUsers: activeUsers });
      }
    } catch (err) {
      console.error('❌ Error actualizando usuarios online:', err);
    }
  },

  // Enviar evento de typing
  sendTypingEvent: async (senderId, receiverId, isTyping = true) => {
    try {
      if (!senderId || !receiverId) {
        return;
      }

      if (isTyping) {
        // Crear o actualizar evento de typing
        const { error } = await supabase
          .from('typing_events')
          .upsert({
            sender_id: senderId,
            receiver_id: receiverId,
            is_typing: true,
            expires_at: new Date(Date.now() + 10000).toISOString() // 10 segundos
          }, {
            onConflict: 'sender_id,receiver_id'
          });

        if (error) {
          console.error('❌ Error enviando evento de typing:', error);
        }
      } else {
        // Actualizar el evento existente para marcar como no typing
        const { error } = await supabase
          .from('typing_events')
          .update({
            is_typing: false,
            expires_at: new Date().toISOString()
          })
          .match({ sender_id: senderId, receiver_id: receiverId });

        if (error) {
          console.error('❌ Error deteniendo evento de typing:', error);
        }

        // Limpieza local inmediata para evitar parpadeos
        set(state => {
          const newTypingUsers = new Set(state.typingUsers);
          newTypingUsers.delete(senderId);
          return { typingUsers: newTypingUsers };
        });
      }
    } catch (error) {
      console.error('❌ Error en sendTypingEvent:', error);
    }
  },

  // Limpiar todas las suscripciones
  cleanup: () => {
    console.log('🧹 Limpiando suscripciones de Realtime');
    
    const { subscriptions, heartbeatInterval, presenceHandlers } = get();
    
    // Cancelar todas las suscripciones
    subscriptions.forEach(subscription => {
      supabase.removeChannel(subscription);
    });

    // Limpiar heartbeat
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }

    if (presenceHandlers?.handleVisibilityChange) {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", presenceHandlers.handleVisibilityChange);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", presenceHandlers.handleVisibilityChange);
      }
    }

    if (presenceHandlers?.handleBeforeUnload && typeof window !== "undefined") {
      window.removeEventListener("beforeunload", presenceHandlers.handleBeforeUnload);
    }

    if (presenceHandlers?.handleUnload && typeof window !== "undefined") {
      window.removeEventListener("unload", presenceHandlers.handleUnload);
    }

    if (presenceHandlers?.visibilityTimeout) {
      clearTimeout(presenceHandlers.visibilityTimeout);
    }

    set({ 
      subscriptions: [],
      heartbeatInterval: null,
      typingUsers: new Set(),
      presenceHandlers: {
        handleVisibilityChange: null,
        visibilityTimeout: null,
      },
    });
  }
}));
