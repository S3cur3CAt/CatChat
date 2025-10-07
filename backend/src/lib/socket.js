import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5001",
      /\.loca\.lt$/,  // Permitir dominios de LocalTunnel
      /^https:\/\/.*\.loca\.lt$/,
      /\.ts\.net$/,  // Permitir dominios de Tailscale
      /^https:\/\/.*\.ts\.net$/,
      "file://",  // Permitir aplicación Electron empaquetada
      /^file:\/\//  // Regex para file:// protocol
    ],
    credentials: true,
  },
  transports: ['polling'], // SOLO polling para Tailscale Funnel - WebSockets causan 502
  allowEIO3: true,
  pingTimeout: 120000, // Timeout más largo para conexiones remotas
  pingInterval: 30000,  // Interval más largo para conexiones remotas
  upgradeTimeout: 60000, // Timeout más largo para upgrade
  maxHttpBufferSize: 1e6,
  // Configuración específica para proxies/tunnels
  allowUpgrades: false, // Desactivar upgrade a WebSocket
  cookie: false // Desactivar cookies para evitar problemas con proxies
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("🔌 A user connected", socket.id);
  console.log("🌐 Connection from:", socket.handshake.headers.origin);
  console.log("🌐 User-Agent:", socket.handshake.headers['user-agent']);

  const userId = socket.handshake.query.userId;
  console.log("👤 Socket userId from query:", userId);

  if (userId) {
    // Verificar si el usuario ya estaba conectado
    if (userSocketMap[userId]) {
      console.log("⚠️ User was already connected, replacing socket:", userSocketMap[userId], "->", socket.id);
      // Desconectar el socket anterior si existe
      const oldSocket = io.sockets.sockets.get(userSocketMap[userId]);
      if (oldSocket && oldSocket.connected) {
        console.log("🔌 Disconnecting old socket for user:", userId);
        oldSocket.disconnect(true);
      }
    }
    
    userSocketMap[userId] = socket.id;
    
    // Actualizar última actividad del usuario
    userLastActivity.set(userId, Date.now());
    
    console.log("✅ DEFINITIVELY Added to userSocketMap:", userId, "->", socket.id);
    console.log("📊 Total users in map:", Object.keys(userSocketMap).length);
    
    // EMISIÓN AGRESIVA INMEDIATA
    const onlineUsers = Object.keys(userSocketMap);
    // Reduced logging to prevent flickering
    
    // Usar debouncing para conexión suave
    emitOnlineUsersDebounced(onlineUsers, 200);
    
    // ACTIVAR HEARTBEAT AUTOMÁTICO: Mantener actividad cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      if (socket.connected && userId) {
        userLastActivity.set(userId, Date.now());
        console.log(`💓 Auto-heartbeat para ${userId}:`, new Date().toLocaleTimeString());
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // Cada 30 segundos
  }

  // Evento para solicitar usuarios online manualmente
  socket.on("requestOnlineUsers", () => {
    // ACTIVIDAD CONSTANTE: Actualizar en cada solicitud
    if (userId) {
      userLastActivity.set(userId, Date.now());
      console.log(`🔄 Actividad actualizada por requestOnlineUsers: ${userId}`);
    }
    
    // Reduced logging to prevent flickering
    const onlineUsers = Object.keys(userSocketMap);
    
    // Usar debouncing para solicitudes manuales
    emitOnlineUsersDebounced(onlineUsers, 100);
  });

  // Evento de heartbeat para mantener actividad
  socket.on("heartbeat", () => {
    if (userId) {
      const now = Date.now();
      userLastActivity.set(userId, now);
      console.log(`❤️ Heartbeat recibido de ${userId} - Actividad actualizada:`, new Date(now).toLocaleTimeString());
      // Responder con pong para confirmar
      socket.emit("heartbeat-pong");
    }
  });

  socket.on("typing", (data) => {
    // Actualizar actividad al escribir
    if (userId) {
      userLastActivity.set(userId, Date.now());
    }
    
    // Reduced logging to prevent flickering
    const { receiverId } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        senderId: userId
      });
    }
  });

  socket.on("stopTyping", (data) => {
    // ACTIVIDAD CONSTANTE: Actualizar en stopTyping
    if (userId) {
      userLastActivity.set(userId, Date.now());
    }
    
    // Reduced logging to prevent flickering
    const { receiverId } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        senderId: userId
      });
    }
  });

  // Video call events
  socket.on("video-call-offer", (data) => {
    console.log("📞 Video call offer from:", userId, "to:", data.to);
    console.log("📞 Current userSocketMap:", userSocketMap);
    console.log("📞 Looking for receiver:", data.to);
    
    const receiverSocketId = getReceiverSocketId(data.to);
    console.log("📞 Receiver socket ID found:", receiverSocketId);
    
    if (receiverSocketId) {
      const offerPayload = {
        offer: data.offer,
        callType: data.callType,
        caller: data.caller
      };
      console.log("📞 Sending offer payload:", offerPayload);
      
      io.to(receiverSocketId).emit("video-call-offer", offerPayload);
      console.log("✅ Video call offer sent to receiver socket:", receiverSocketId);
    } else {
      console.log("❌ Receiver not found or offline for video call");
      console.log("❌ Available users:", Object.keys(userSocketMap));
      // Notify caller that receiver is offline
      socket.emit("video-call-failed", {
        reason: "User is offline"
      });
    }
  });

  socket.on("video-call-answer", (data) => {
    console.log("📞 Video call answer from:", userId, "to:", data.to);
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-call-answer", {
        answer: data.answer
      });
      console.log("✅ Video call answer sent to caller");
    }
  });

  socket.on("ice-candidate", (data) => {
    console.log("🧊 ICE candidate from:", userId, "to:", data.to);
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", {
        candidate: data.candidate
      });
    }
  });

  socket.on("video-call-rejected", (data) => {
    console.log("❌ Video call rejected by:", userId, "to:", data.to);
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-call-rejected");
      console.log("✅ Video call rejection sent to caller");
    }
  });

  socket.on("video-call-ended", (data) => {
    console.log("📞 Video call ended by:", userId, "to:", data.to);
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-call-ended");
      console.log("✅ Video call end notification sent");
    }
  });

  socket.on("video-call-request-real-offer", (data) => {
    console.log("📞 Request for real offer from:", userId, "to:", data.to);
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-call-request-real-offer", {
        from: userId
      });
      console.log("✅ Real offer request sent");
    }
  });

  socket.on("video-call-real-offer", (data) => {
    console.log("📞 Real WebRTC offer from:", userId, "to:", data.to);
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-call-real-offer", {
        from: userId,
        offer: data.offer
      });
      console.log("✅ Real WebRTC offer sent");
    }
  });

  // Screen sharing renegotiation events
  socket.on("video-call-renegotiation", (data) => {
    console.log("🔄 Video call renegotiation from:", userId, "to:", data.to);
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-call-renegotiation", {
        from: userId,
        offer: data.offer
      });
      console.log("✅ Renegotiation offer sent");
    }
  });

  socket.on("video-call-renegotiation-answer", (data) => {
    console.log("✅ Video call renegotiation answer from:", userId, "to:", data.to);
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-call-renegotiation-answer", {
        from: userId,
        answer: data.answer
      });
      console.log("✅ Renegotiation answer sent");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ A user disconnected", socket.id, "Reason:", reason);
    console.log("🗑️ Removing userId:", userId, "from userSocketMap");
    
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      userLastActivity.delete(userId); // Limpiar actividad también
      console.log("✅ User removed from map and activity cleaned");
    } else {
      console.log("⚠️ User was not in map or userId is undefined");
    }
    
    // Emitir usuarios online con debouncing para transición suave
    const onlineUsers = Object.keys(userSocketMap);
    // Reduced logging to prevent flickering
    // Usar debouncing para evitar parpadeo en disconnect
    emitOnlineUsersDebounced(onlineUsers, 300);
  });
});

// Función para obtener usuarios online (para usar desde otros módulos)
export const getCurrentOnlineUsers = () => {
  return Object.keys(userSocketMap);
};

// Heartbeat con debouncing para transiciones suaves
let lastEmittedUsers = [];
let emissionTimeout = null;

// Mapa para rastrear la última actividad de cada usuario
const userLastActivity = new Map();
const USER_TIMEOUT = 120000; // 120 segundos (2 minutos) para considerar usuario inactivo

// Función para emitir con debouncing
const emitOnlineUsersDebounced = (users, delay = 500) => {
  if (emissionTimeout) {
    clearTimeout(emissionTimeout);
  }
  
  emissionTimeout = setTimeout(() => {
    const usersChanged = JSON.stringify(users.sort()) !== JSON.stringify(lastEmittedUsers.sort());
    
    if (usersChanged) {
      // Reduced logging to prevent flickering
      io.emit("getOnlineUsers", users);
      lastEmittedUsers = [...users];
    }
    emissionTimeout = null;
  }, delay);
};

// Función para limpiar usuarios inactivos
function cleanupInactiveUsers() {
  const now = Date.now();
  let removedUsers = 0;
  
  console.log('🔍 CLEANUP: Verificando usuarios inactivos...');
  
  for (const [userId, socketId] of Object.entries(userSocketMap)) {
    const socket = io.sockets.sockets.get(socketId);
    const lastActivity = userLastActivity.get(userId) || 0;
    const inactiveTime = now - lastActivity;
    const isInactive = inactiveTime > USER_TIMEOUT;
    
    console.log(`🔍 Usuario ${userId}:`, {
      socketExists: !!socket,
      socketConnected: socket?.connected,
      lastActivity: new Date(lastActivity).toLocaleTimeString(),
      inactiveSeconds: Math.round(inactiveTime / 1000),
      isInactive: isInactive
    });
    
    // Remover si socket no existe, no está conectado, o usuario inactivo
    if (!socket || !socket.connected || !socket.handshake || socket.handshake.query.userId !== userId || isInactive) {
      console.log(`🗑️ REMOVIENDO usuario: ${userId} - Razón:`, {
        noSocket: !socket,
        notConnected: !socket?.connected,
        noHandshake: !socket?.handshake,
        wrongUserId: socket?.handshake?.query?.userId !== userId,
        inactive: isInactive,
        inactiveSeconds: Math.round(inactiveTime / 1000)
      });
      delete userSocketMap[userId];
      userLastActivity.delete(userId);
      removedUsers++;
    }
  }
  
  if (removedUsers > 0) {
    console.log(`✅ ${removedUsers} usuarios inactivos removidos`);
  } else {
    console.log('✅ Todos los usuarios están activos');
  }
  
  return removedUsers;
}

setInterval(() => {
  const originalUsers = Object.keys(userSocketMap);
  
  // LIMPIEZA INTELIGENTE: Verificar sockets y actividad
  const removedCount = cleanupInactiveUsers();
  
  const currentOnlineUsers = Object.keys(userSocketMap);
  
  // Emitir solo si hubo cambios
  if (removedCount > 0 || originalUsers.length > 0) {
    emitOnlineUsersDebounced(currentOnlineUsers, 1000);
  }
  
}, 60000); // Cada 60 segundos para evitar limpieza agresiva

// Heartbeat de verificación con debouncing
setInterval(() => {
  const onlineUsers = Object.keys(userSocketMap);
  // Reduced logging and frequency to prevent flickering
  
  // Usar debouncing para heartbeat de verificación
  if (onlineUsers.length > 0) {
    emitOnlineUsersDebounced(onlineUsers, 2000);
  }
}, 60000); // Cada 60 segundos para eliminar parpadeo

// Función para limpiar completamente el mapa de usuarios
export const clearAllUsers = () => {
  console.log('🗑️ Limpiando mapa de usuarios online...');
  const userCount = Object.keys(userSocketMap).length;
  
  // Limpiar el mapa de usuarios
  for (const userId in userSocketMap) {
    delete userSocketMap[userId];
  }
  
  console.log(`✅ ${userCount} usuarios removidos del mapa`);
  
  // Emitir lista vacía a cualquier cliente que pueda estar conectado
  if (io) {
    io.emit("getOnlineUsers", []);
    console.log('✅ Lista de usuarios online limpiada y emitida');
  }
};

export { io, app, server };
