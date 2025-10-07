import { UserModel, MessageModel } from "../models/supabase.models.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    // Usar req.user.id (que es el ID real de la base de datos) en lugar de req.user._id
    const loggedInUserId = req.user.id;
    // Removed excessive logging to prevent flickering

    const filteredUsers = await UserModel.findAllExcept(loggedInUserId);

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { limit = 50, page = 1 } = req.query;
    const myId = req.user.id; // Cambiar a req.user.id

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    const messages = await MessageModel.findBetweenUsers(myId, userToChatId, limitNum, offset);

    // Obtener el total de mensajes para la paginación
    const totalMessages = await MessageModel.countBetweenUsers(myId, userToChatId);

    // Reduced logging to prevent flickering

    res.status(200).json({
      messages: messages,
      totalMessages,
      currentPage: pageNum,
      totalPages: Math.ceil(totalMessages / limitNum)
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id; // Cambiar a req.user.id

    console.log('📨 sendMessage called');
    console.log('Sender ID:', senderId, 'Receiver ID:', receiverId);

    let imageUrl;
    if (image) {
      // Validar que la imagen sea base64 válida
      if (!image.startsWith('data:image')) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      imageUrl = image; // Almacenar como base64 directamente
    }

    const newMessage = await MessageModel.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    console.log('✅ Message created:', {
      id: newMessage.id,
      sender_id: newMessage.sender_id,
      receiver_id: newMessage.receiver_id,
      created_at: newMessage.created_at,
      text: newMessage.text?.substring(0, 50)
    });

    // Buscar socket del receptor
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log('🔍 Looking for receiver socket...');
    console.log('Receiver ID:', receiverId);
    console.log('Receiver socket ID found:', receiverSocketId);

    if (receiverSocketId) {
      console.log('📡 Emitting newMessage to receiver socket:', receiverSocketId);
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log('✅ Message emitted to receiver');
    } else {
      console.log('⚠️ Receiver not connected or socket not found');
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("❌ Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user.id; // Cambiar a req.user.id

    // Delete all messages between current user and the specified user
    await MessageModel.deleteConversation(currentUserId, otherUserId);

    res.status(200).json({
      message: "Conversation deleted successfully",
      deletedCount: 0 // Supabase no devuelve el count en delete
    });
  } catch (error) {
    console.log("Error in deleteConversation controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ deleteMessage called:', { messageId, userId });

    // Buscar el mensaje para verificar que existe y pertenece al usuario
    const message = await MessageModel.findById(messageId);
    if (!message) {
      console.log('❌ Message not found');
      return res.status(404).json({ message: "Message not found" });
    }

    // Verificar que el mensaje pertenece al usuario actual
    if (message.sender_id !== userId) {
      console.log('❌ User not authorized to delete this message', {
        messageSender: message.sender_id,
        requestingUser: userId
      });
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    console.log('✅ User authorized to delete message');

    // Eliminar el mensaje
    await MessageModel.delete(messageId);
    console.log('✅ Message deleted from database');

    // Notificar a los usuarios conectados que el mensaje fue eliminado
    // Enviar tanto al receptor como al emisor (por si tienen múltiples pestañas abiertas)
    const receiverSocketId = getReceiverSocketId(message.receiver_id);
    const senderSocketId = getReceiverSocketId(message.sender_id);

    // Notificar al receptor si está conectado
    if (receiverSocketId) {
      console.log('📡 Notifying receiver about deleted message');
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    // Notificar al emisor si está conectado (útil para múltiples dispositivos)
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      console.log('📡 Notifying sender about deleted message');
      io.to(senderSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("❌ Error in deleteMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};