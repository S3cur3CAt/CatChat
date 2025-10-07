# Fullstack Chat App - Versión Electron con LocalTunnel

Una aplicación de chat completa con videollamadas, screen sharing y túneles públicos automáticos usando LocalTunnel.

## 🌟 Características

- **Chat en tiempo real** con Socket.IO
- **Videollamadas** con WebRTC
- **Screen sharing** con renegociación automática
- **Túnel público automático** con LocalTunnel
- **Aplicación de escritorio** con Electron
- **Servidor integrado** - cada instalación actúa como servidor y cliente
- **Instalador para Windows 11**

## 🚀 Instalación Rápida

### Para Usuarios (Instalador)

1. **Descargar el instalador** desde la carpeta `electron/dist/`
2. **Ejecutar** `Fullstack Chat App Setup.exe`
3. **Seguir** las instrucciones del instalador
4. **Abrir** la aplicación desde el escritorio o menú inicio

### Para Desarrolladores

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd fullstack-chat-app

# Construir la aplicación completa
node build-electron.js

# O construir manualmente paso a paso:

# 1. Backend
cd backend
npm install

# 2. Frontend
cd ../frontend
npm install
npm run build

# 3. Electron
cd ../electron
npm install
npm run build-win
```

## 🔧 Desarrollo

### Ejecutar en modo desarrollo

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Electron
cd electron
npm run dev
```

### Construir para producción

```bash
# Construcción automática completa
node build-electron.js

# O por separado:
cd electron
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

## 🌐 Cómo Funciona LocalTunnel

### Funcionamiento Automático

1. **Al iniciar la aplicación:**
   - Se inicia el servidor backend en puerto 5001
   - Se crea automáticamente un túnel LocalTunnel
   - Se obtiene una URL pública (ej: `https://abc123.loca.lt`)
   - La aplicación se conecta a esta URL

2. **Compartir con otros usuarios:**
   - Cada usuario instala la aplicación
   - Cada instalación crea su propio túnel
   - Los usuarios se conectan entre sí usando las URLs públicas

### Configuración Manual (Opcional)

Si quieres usar un subdominio específico:

```javascript
// En electron/main.js, línea ~95
tunnel = await localtunnel({
  port: BACKEND_PORT,
  subdomain: 'mi-chat-personalizado' // Agregar esta línea
});
```

## 📱 Uso de la Aplicación

### Primera Vez

1. **Abrir la aplicación** - Se mostrará una pantalla de carga
2. **Esperar** a que se configure el túnel (30-60 segundos)
3. **Copiar la URL** que aparece en el diálogo
4. **Compartir la URL** con otros usuarios
5. **Registrarse** o iniciar sesión

### Conectar con Otros Usuarios

**Opción 1: Mismo servidor**
- Si otros usuarios usan tu URL, se conectarán a tu servidor
- Todos verán los mismos usuarios online

**Opción 2: Servidores separados**
- Cada usuario puede tener su propio servidor
- Para conectarse, necesitan usar la misma URL

### Videollamadas y Screen Sharing

1. **Iniciar videollamada** - Clic en el icono de video
2. **Configurar dispositivos** - Seleccionar cámara/micrófono
3. **Compartir pantalla** - Clic en el icono de monitor durante la llamada
4. **Pantalla completa** - Clic en el icono de maximizar

## 🛠️ Estructura del Proyecto

```
fullstack-chat-app/
├── backend/                 # Servidor Express + Socket.IO
├── frontend/               # Cliente React + Vite
├── electron/              # Aplicación Electron
│   ├── main.js           # Proceso principal
│   ├── preload.js        # Script de precarga
│   ├── loading.html      # Página de carga
│   ├── package.json      # Configuración Electron
│   └── assets/           # Iconos y recursos
├── build-electron.js     # Script de construcción
└── README-ELECTRON.md    # Este archivo
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
# Backend (.env)
PORT=5001
MONGODB_URI=mongodb://localhost:27017/fullstack-chat
JWT_SECRET=tu-secret-key
NODE_ENV=production

# Frontend (.env)
VITE_API_URL=auto  # Se configura automáticamente
```

### Personalización del Túnel

```javascript
// electron/main.js
const tunnel = await localtunnel({
  port: BACKEND_PORT,
  subdomain: 'mi-app-chat',  // Subdominio personalizado
  local_host: 'localhost',   # Host local
  allow_invalid_cert: true   # Permitir certificados inválidos
});
```

### Configuración del Firewall

La aplicación configura automáticamente el firewall de Windows, pero puedes hacerlo manualmente:

```cmd
# Permitir la aplicación
netsh advfirewall firewall add rule name="Fullstack Chat App" dir=in action=allow program="C:\ruta\a\tu\app.exe"

# Permitir puerto específico
netsh advfirewall firewall add rule name="Chat Port 5001" dir=in action=allow protocol=TCP localport=5001
```

## 🐛 Solución de Problemas

### Error: "No se puede crear el túnel"

```bash
# Verificar conectividad
ping loca.lt

# Reiniciar la aplicación
# Verificar que el puerto 5001 esté libre
netstat -an | findstr :5001
```

### Error: "Socket desconectado"

1. Verificar conexión a internet
2. Reiniciar la aplicación
3. Verificar que la URL del túnel sea accesible

### Error: "Videollamada no conecta"

1. Verificar permisos de cámara/micrófono
2. Verificar firewall
3. Probar en modo desarrollo

### Error: "Screen sharing no funciona"

1. Verificar permisos de pantalla
2. Reiniciar la videollamada
3. Verificar que ambos usuarios estén conectados

## 📦 Distribución

### Crear Instalador

```bash
# Windows
cd electron
npm run build-win

# Archivos generados:
# - dist/Fullstack Chat App Setup.exe (Instalador)
# - dist/win-unpacked/ (Aplicación sin empaquetar)
```

### Subir a la Nube (Opcional)

```bash
# Subir instalador a GitHub Releases, Google Drive, etc.
# Los usuarios pueden descargar e instalar directamente
```

## 🔒 Seguridad

### Consideraciones

- **LocalTunnel es público** - Cualquiera con la URL puede acceder
- **Usar contraseñas fuertes** para las cuentas
- **No compartir URLs** con usuarios no confiables
- **Considerar HTTPS** para producción seria

### Mejoras de Seguridad

```javascript
// Agregar autenticación básica al túnel
tunnel = await localtunnel({
  port: BACKEND_PORT,
  subdomain: 'mi-app-segura'
});

// Configurar CORS más restrictivo en backend
app.use(cors({
  origin: [tunnel.url],
  credentials: true
}));
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver `LICENSE.txt` para detalles.

## 🆘 Soporte

- **Issues**: Crear issue en GitHub
- **Documentación**: Este README
- **Logs**: Ver consola de la aplicación (F12 en Electron)

---

**¡Disfruta tu nueva aplicación de chat con túneles automáticos!** 🚀
