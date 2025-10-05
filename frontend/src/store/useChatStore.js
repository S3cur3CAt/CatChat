import { create } from "zustand";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./useAuthStore";

// Función para mostrar notificaciones de Windows
const showWindowsNotification = async (title, body, icon = null) => {
  console.log('🔔 Attempting to show notification:', { title, body, hasElectronAPI: !!window.electronAPI });
  
  // FORZAR notificaciones en Electron
  if (window.electronAPI) {
    try {
      console.log('📱 Using Electron native notifications');
      const success = await window.electronAPI.showNotification(title, body, icon);
      if (success) {
        console.log('✅ Notificación nativa de Electron mostrada');
        return true;
      }
    } catch (error) {
      console.error('❌ Error mostrando notificación nativa:', error);
    }
  }

  // Fallback a notificaciones web
  if (!("Notification" in window)) {
    console.log("❌ Este navegador no soporta notificaciones");
    return false;
  }

  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, {
        body: body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
        tag: "chat-message",
        requireInteraction: false,
        silent: false
      });

      setTimeout(() => notification.close(), 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      return true;
    } catch (error) {
      console.error('❌ Error creating web notification:', error);
      return false;
    }
  } else if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        return await showWindowsNotification(title, body, icon);
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
    }
  }
  
  return false;
};

// Lock para evitar crear conversaciones duplicadas
const conversationLocks = new Map();

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  currentConversationId: null,
  conversationCache: {},
  paginationInfo: { currentPage: 1, totalPages: 1 },
  hasMoreMessages: false,
  loadMoreMessages: async () => {
    // Paginación no implementada en Supabase aún
    return { messages: [], paginationInfo: { currentPage: 1, totalPages: 1 } };
  },

  // Obtener usuarios (todos los perfiles excepto el actual)
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const authUser = useAuthStore.getState().authUser;
      
      if (!authUser) {
        set({ users: [] });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, profile_pic')
        .neq('id', authUser.id);

      if (error) throw error;

      const users = (data || []).map(user => ({
        _id: user.id,
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        profilePic: user.profile_pic
      }));

      set({ users });
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error(error.message || "Failed to load users");
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Obtener o crear conversación entre dos usuarios
  getOrCreateConversation: async (otherUserId) => {
    const authUser = useAuthStore.getState().authUser;
    
    if (!authUser) throw new Error('No user logged in');

    const { conversationCache } = get();

    if (conversationCache[otherUserId]) {
      return conversationCache[otherUserId];
    }

    // Crear clave única para el lock (ordenar IDs para que sea consistente)
    const lockKey = [authUser.id, otherUserId].sort().join('-');
    
    // Si ya hay una creación en proceso, esperar a que termine
    const pendingPromise = conversationLocks.get(lockKey);
    if (pendingPromise) {
      console.log('⏳ Esperando a que termine la creación de conversación...');
      return await pendingPromise;
    }

    let resolveLock;
    let rejectLock;
    const lockPromise = new Promise((resolve, reject) => {
      resolveLock = resolve;
      rejectLock = reject;
    });
    conversationLocks.set(lockKey, lockPromise);

    try {
      const { data: conversationId, error: rpcError } = await supabase.rpc(
        "get_or_create_conversation",
        { other_user: otherUserId }
      );

      if (rpcError) throw rpcError;
      if (!conversationId) throw new Error('Conversation ID not returned');

      console.log('💬 Conversación obtenida desde RPC:', conversationId);

      resolveLock(conversationId);
      set(state => ({
        conversationCache: {
          ...state.conversationCache,
          [otherUserId]: conversationId
        }
      }));
      return conversationId;
    } catch (error) {
      rejectLock(error);
      console.error('Error getting/creating conversation:', error);
      throw error;
    } finally {
      conversationLocks.delete(lockKey);
    }
  },

  // Obtener mensajes de una conversación
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const authUser = useAuthStore.getState().authUser;
      
      console.log('📥 getMessages llamado para userId:', userId);
      
      if (!authUser) {
        console.log('❌ No hay authUser');
        set({ messages: [] });
        return;
      }

      // Obtener o crear conversación
      const conversationId = await get().getOrCreateConversation(userId);
      console.log('💬 Conversation ID:', conversationId);
      set({ currentConversationId: conversationId });

      // Obtener mensajes
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('❌ Error obteniendo mensajes:', error);
        throw error;
      }

      console.log('📨 Mensajes cargados:', data?.length || 0, 'mensajes');
      set({ messages: data || [] });
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error(error.message || "Failed to load messages");
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Enviar mensaje
  sendMessage: async (messageData) => {
    const { selectedUser, messages, currentConversationId } = get();
    const authUser = useAuthStore.getState().authUser;

    if (!authUser || !selectedUser) return;

    // Mensaje optimista
    const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage = {
      id: tempMessageId,
      conversation_id: currentConversationId,
      sender_id: authUser.id,
      text: messageData.text,
      image_url: messageData.image,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    console.log('🚀 Adding optimistic message:', tempMessageId);
    set({ messages: [...messages, optimisticMessage] });

    try {
      // Subir imagen si existe
      let imageUrl = null;
      if (messageData.image) {
        const blob = await fetch(messageData.image).then(r => r.blob());
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('messages')
          .upload(`conversations/${currentConversationId}/${fileName}`, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('messages')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      // Insertar mensaje
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          sender_id: authUser.id,
          text: messageData.text,
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;

      // Reemplazar mensaje optimista con el real
      const { messages: currentMessages } = get();
      const updatedMessages = currentMessages.map(msg =>
        msg.id === tempMessageId ? { ...newMessage, isOptimistic: false } : msg
      );
      set({ messages: updatedMessages });

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);

      // Remover mensaje optimista
      const { messages: currentMessages } = get();
      const filteredMessages = currentMessages.filter(msg => msg.id !== tempMessageId);
      set({ messages: filteredMessages });

      toast.error(error.message || "Failed to send message");
    }
  },

  // Eliminar mensaje
  deleteMessage: async (messageId) => {
    console.log('🗑️ Deleting message:', messageId);
    try {
      const authUser = useAuthStore.getState().authUser;
      
      if (!authUser) throw new Error('No user logged in');

      // Verificar que el mensaje pertenece al usuario
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      if (message.sender_id !== authUser.id) {
        throw new Error('You can only delete your own messages');
      }

      // Eliminar mensaje
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Actualizar estado local
      const { messages } = get();
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      set({ messages: updatedMessages });

      toast.success("Message deleted");
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      toast.error(error.message || "Failed to delete message");
    }
  },

  // Suscribirse a mensajes en tiempo real (se maneja en useRealtimeStore)
  subscribeToMessages: () => {
    // La suscripción se maneja en useRealtimeStore
    console.log('📨 Message subscription handled by useRealtimeStore');
  },

  unsubscribeFromMessages: () => {
    // La limpieza se maneja en useRealtimeStore
    console.log('📨 Message unsubscription handled by useRealtimeStore');
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setUsers: (users) => set({ users }),

  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter(msg => msg.id !== messageId)
    }));
  },

  // Agregar mensaje desde Realtime
  addMessage: (message) => {
    const { messages, currentConversationId, selectedUser } = get();
    
    console.log('📨 addMessage llamado:', { 
      messageConvId: message.conversation_id, 
      currentConvId: currentConversationId,
      selectedUserId: selectedUser?.id,
      messageSenderId: message.sender_id
    });
    
    // Si el mensaje es de la conversación actual, agregarlo
    if (message.conversation_id === currentConversationId) {
      // Verificar duplicados
      const exists = messages.some(msg => msg.id === message.id);
      if (exists) {
        console.log('⏭️ Mensaje duplicado ignorado');
        return;
      }

      console.log('✅ Agregando mensaje a la UI (conversación actual)');
      set({ messages: [...messages, message] });
    } else {
      // Si el mensaje NO es de la conversación actual pero el usuario está seleccionado,
      // actualizar la conversación actual
      if (selectedUser && (message.sender_id === selectedUser.id || message.sender_id === useAuthStore.getState().authUser?.id)) {
        console.log('🔄 Actualizando conversación actual y agregando mensaje');
        set({ 
          currentConversationId: message.conversation_id,
          messages: [message] 
        });
      } else {
        console.log('⏭️ Mensaje ignorado: no es de la conversación actual ni del usuario seleccionado');
      }
    }

    // Mostrar notificación si es necesario
    const authUser = useAuthStore.getState().authUser;
    if (message.sender_id !== authUser?.id) {
      const { users, selectedUser } = get();
      const sender = users.find(u => u.id === message.sender_id);
      
      if (sender && (!selectedUser || selectedUser.id !== message.sender_id)) {
        showWindowsNotification(
          `New message from ${sender.fullName || sender.email}`,
          message.text || 'Sent an image',
          sender.profilePic
        );
      }
    }
  }
}));
