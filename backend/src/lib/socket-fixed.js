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
      /^https:\/\/.*\.loca\.lt$/
    ],
    credentials: true,
  },
  transports: ['polling', 'websocket'], // Priorizar polling para túneles
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("Socket userId from query:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("Added to userSocketMap:", userId, "->", socket.id);
  }

  // Enviar usuarios online desde el mapa de sockets (más confiable)
  const onlineUsers = Object.keys(userSocketMap);
  console.log("Current online users from Socket map:", onlineUsers);
  io.emit("getOnlineUsers", onlineUsers);

  socket.on("typing", (data) => {
    console.log("Backend received typing event:", data, "from user:", userId);
    const { receiverId } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("Receiver socket ID:", receiverSocketId);
    if (receiverSocketId) {
      console.log("Sending typing event to receiver:", receiverId);
      io.to(receiverSocketId).emit("typing", {
        senderId: userId
      });
    } else {
      console.log("Receiver not found or offline:", receiverId);
    }
  });

  socket.on("stopTyping", (data) => {
    console.log("Backend received stopTyping event:", data, "from user:", userId);
    const { receiverId } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("Receiver socket ID:", receiverSocketId);
    if (receiverSocketId) {
      console.log("Sending stopTyping event to receiver:", receiverId);
      io.to(receiverSocketId).emit("stopTyping", {
        senderId: userId
      });
    } else {
      console.log("Receiver not found or offline:", receiverId);
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

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    console.log("Removing userId:", userId, "from userSocketMap");
    delete userSocketMap[userId];
    
    // Emitir usuarios online actualizados
    const onlineUsers = Object.keys(userSocketMap);
    console.log("Updated online users after disconnect:", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

// Función para obtener usuarios online (para usar desde otros módulos)
export const getCurrentOnlineUsers = () => {
  return Object.keys(userSocketMap);
};

export { io, app, server };
