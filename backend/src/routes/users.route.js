import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCurrentOnlineUsers } from "../lib/socket.js";
import { getOnlineUsers, setUserOnline, setUserOffline, cleanupOfflineUsers } from "../lib/userStatus.js";

const router = express.Router();

// Obtener usuarios online (con fallback a Supabase)
router.get("/online", protectRoute, async (req, res) => {
  try {
    // Intentar obtener desde Socket.IO primero
    let onlineUsers = await getCurrentOnlineUsers();
    
    // Si no hay usuarios online desde Socket.IO, usar Supabase como fallback
    if (!onlineUsers || onlineUsers.length === 0) {
      onlineUsers = await getOnlineUsers();
    }
    
    res.json({ onlineUsers });
  } catch (error) {
    console.error("Error getting online users:", error);
    res.status(500).json({ message: "Error getting online users" });
  }
});

// Marcar usuario como online (para polling)
router.post("/online", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    await setUserOnline(userId);
    
    // Obtener lista actualizada
    const onlineUsers = await getOnlineUsers();
    res.json({ success: true, onlineUsers });
  } catch (error) {
    console.error("Error setting user online:", error);
    res.status(500).json({ message: "Error setting user online" });
  }
});

// Manejar OPTIONS para el endpoint offline
router.options("/offline", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

// Marcar usuario como offline (para desconexión)
router.post("/offline", async (req, res) => {
  try {
    console.log("📥 Recibido request para marcar offline");
    console.log("📥 Headers content-type:", req.headers['content-type']);
    console.log("📥 Body type:", typeof req.body);
    console.log("📥 Body:", req.body);
    
    let userId = null;
    
    // Manejar diferentes formatos de body
    if (typeof req.body === 'string') {
      // Si viene como string, intentar parsearlo
      try {
        const parsed = JSON.parse(req.body);
        userId = parsed.userId;
      } catch (e) {
        console.log("⚠️ No se pudo parsear body como JSON");
      }
    } else if (req.body && typeof req.body === 'object') {
      // Si ya es un objeto
      userId = req.body.userId;
    }
    
    if (userId) {
      const result = await setUserOffline(userId);
      console.log(`✅ Usuario ${userId} marcado como offline - Resultado: ${result}`);
      
      // Forzar limpieza de usuarios inactivos
      const cleanupResult = await cleanupOfflineUsers();
      console.log(`🧹 Limpieza ejecutada después de offline: ${cleanupResult}`);
    } else {
      console.log("⚠️ No se recibió userId en el request");
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error setting user offline:", error);
    res.status(500).json({ message: "Error setting user offline" });
  }
});

// Endpoint para obtener mensajes nuevos (polling)
router.get("/messages/poll/:conversationId", protectRoute, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { lastMessageId } = req.query;
    
    // Aquí implementarías la lógica para obtener mensajes nuevos
    // desde la última vez que el cliente hizo polling
    
    res.json({ messages: [], hasNewMessages: false });
  } catch (error) {
    console.error("Error polling messages:", error);
    res.status(500).json({ message: "Error polling messages" });
  }
});

export default router;
