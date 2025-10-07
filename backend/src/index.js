import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";

import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import usersRoutes from "./routes/users.route.js";
import realtimeRoutes from "./routes/realtime.route.js";
import { app, server, io, clearAllUsers } from "./lib/socket.js";
import { cleanupOfflineUsers } from "./lib/userStatus.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
let cleanupInterval; // Para guardar referencia del interval de limpieza

// CORS debe ir primero
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5001",
      /\.loca\.lt$/,  // Permitir dominios de LocalTunnel
      /^https:\/\/.*\.loca\.lt$/,
      /\.ts\.net$/,  // Permitir dominios de Tailscale
      /^https:\/\/.*\.ts\.net$/
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text()); // Para manejar sendBeacon
app.use(express.raw({ type: 'application/json' })); // Para manejar Blob de sendBeacon
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/realtime", realtimeRoutes);
// Servir archivos estáticos del frontend (tanto en desarrollo como producción para Electron)
// Usar ruta absoluta para evitar problemas con el directorio de Trabajo
let currentDir = path.dirname(new URL(import.meta.url).pathname);
if (process.platform === 'win32' && currentDir.startsWith('/')) {
  currentDir = currentDir.substring(1);
}

const projectRoot = path.resolve(currentDir, '../../');
const frontendDistPath = path.join(projectRoot, 'frontend/dist');

console.log('📁 currentDir:', currentDir);
console.log('📁 Directorio del proyecto:', projectRoot);
console.log('📁 Sirviendo archivos estáticos desde:', frontendDistPath);

// Verificar que el directorio existe
if (fs.existsSync(frontendDistPath)) {
  console.log('✅ Directorio frontend/dist encontrado');
  app.use(express.static(frontendDistPath));
} else {
  console.error('❌ Directorio frontend/dist no encontrado:', frontendDistPath);
}

app.get("*", (req, res) => {
  // Solo servir el HTML para rutas que no sean de API
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(frontendDistPath, "index.html");
    console.log('📄 Sirviendo index.html desde:', indexPath);
    
    // Verificar si el archivo existe
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('❌ Archivo index.html no encontrado en:', indexPath);
      res.status(404).send('Frontend no encontrado. Asegúrate de construir el frontend primero.');
    }
  }
});

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  console.log("Using Supabase as database");
  
  // Iniciar limpieza periódica de usuarios inactivos
  cleanupInterval = setInterval(async () => {
    console.log('🔄 Ejecutando limpieza de usuarios inactivos...');
    await cleanupOfflineUsers();
  }, 1000); // Cada 15 segundos para detección más rápida
});

// Función de limpieza completa
function performServerCleanup() {
  console.log('🗑️ Iniciando limpieza completa del servidor...');
  
  // Limpiar interval de limpieza
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    console.log('✅ Interval de limpieza detenido');
  }
  
  // Limpiar mapa de usuarios online
  clearAllUsers();
  
  // Cerrar todas las conexiones socket
  if (io) {
    io.close(() => {
      console.log('✅ Todas las conexiones socket cerradas');
    });
  }
  
  // Cerrar servidor HTTP
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado');
    process.exit(0);
  });
}

// Manejo de señales para limpieza completa
process.on('SIGTERM', () => {
  console.log('🗑️ SIGTERM recibido - Cerrando servidor y sockets...');
  performServerCleanup();
});

process.on('SIGINT', () => {
  console.log('🗑️ SIGINT recibido - Cerrando servidor y sockets...');
  performServerCleanup();
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('🚫 Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚫 Promesa rechazada no manejada:', reason);
  process.exit(1);
});
