import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { setUserOnline, setUserOffline, getOnlineUsers } from "../lib/userStatus.js";

const router = express.Router();

// Store para eventos de typing temporales
const typingEvents = new Map(); // userId -> { receiverId, timestamp }

// Limpiar eventos de typing expirados cada 10 segundos
setInterval(() => {
  const now = Date.now();
  for (const [userId, event] of typingEvents.entries()) {
    if (now - event.timestamp > 10000) { // 10 segundos
      typingEvents.delete(userId);
    }
  }
}, 10000);

// Endpoint para heartbeat (mantener usuario online)
router.post("/heartbeat", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    await setUserOnline(userId);
    
    const onlineUsers = await getOnlineUsers();
    res.json({ success: true, onlineUsers });
  } catch (error) {
    console.error("Error en heartbeat:", error);
    res.status(500).json({ message: "Error en heartbeat" });
  }
});

// Endpoint para obtener usuarios online
router.get("/online-users", protectRoute, async (req, res) => {
  try {
    const onlineUsers = await getOnlineUsers();
    res.json({ onlineUsers });
  } catch (error) {
    console.error("Error obteniendo usuarios online:", error);
    res.status(500).json({ message: "Error obteniendo usuarios online" });
  }
});

// Endpoint para marcar usuario como offline
router.post("/offline", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    await setUserOffline(userId);
    
    const onlineUsers = await getOnlineUsers();
    res.json({ success: true, onlineUsers });
  } catch (error) {
    console.error("Error marcando usuario offline:", error);
    res.status(500).json({ message: "Error marcando usuario offline" });
  }
});

// Endpoint para eventos de typing
router.post("/typing", protectRoute, async (req, res) => {
  try {
    const { receiverId, isTyping } = req.body;
    const senderId = req.user._id;
    
    if (isTyping) {
      typingEvents.set(senderId, {
        receiverId,
        timestamp: Date.now()
      });
    } else {
      typingEvents.delete(senderId);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error en evento de typing:", error);
    res.status(500).json({ message: "Error en evento de typing" });
  }
});

// Endpoint para obtener eventos de typing para un usuario
router.get("/typing/:userId", protectRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const typingUsers = [];
    
    for (const [senderId, event] of typingEvents.entries()) {
      if (event.receiverId === userId && Date.now() - event.timestamp < 10000) {
        typingUsers.push(senderId);
      }
    }
    
    res.json({ typingUsers });
  } catch (error) {
    console.error("Error obteniendo eventos de typing:", error);
    res.status(500).json({ message: "Error obteniendo eventos de typing" });
  }
});

// Endpoint para polling de mensajes nuevos
router.get("/messages/:conversationId", protectRoute, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { since } = req.query; // timestamp desde cuando buscar
    
    // Aquí implementarías la lógica para obtener mensajes nuevos
    // desde el timestamp 'since'
    
    res.json({ 
      messages: [], 
      hasNewMessages: false,
      lastCheck: Date.now()
    });
  } catch (error) {
    console.error("Error en polling de mensajes:", error);
    res.status(500).json({ message: "Error en polling de mensajes" });
  }
});

export default router;
