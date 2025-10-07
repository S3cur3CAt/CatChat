# 📹 Guía de Videollamadas con Supabase y Electron

## 🎯 Descripción General

Este sistema implementa videollamadas WebRTC usando Supabase Realtime para la señalización y Electron para acceso nativo a cámara, micrófono y compartir pantalla.

## 🏗️ Arquitectura

### Componentes Principales

1. **Base de Datos Supabase**
   - `video_calls`: Tabla para gestionar llamadas activas
   - `webrtc_signals`: Tabla para señales WebRTC (offer, answer, ICE candidates)

2. **Servicio de Videollamadas**
   - `supabaseVideoCallService.js`: Maneja la comunicación con Supabase
   - `useSupabaseVideoCallStore.js`: Store de Zustand para el estado de videollamadas

3. **Integración con Electron**
   - Permisos de cámara/micrófono
   - Desktop capture para compartir pantalla
   - APIs nativas expuestas a través de preload.js

4. **Componentes UI**
   - `SupabaseVideoCallModal.jsx`: Modal para llamadas entrantes
   - `SupabaseVideoCallPage.jsx`: Página principal de videollamada

## 🚀 Configuración

### 1. Configurar Base de Datos en Supabase

Ejecuta el script SQL en tu proyecto de Supabase:

```bash
# Ejecutar el archivo SQL en Supabase
supabase db push supabase-videocalls-setup.sql
```

O copia el contenido de `supabase-videocalls-setup.sql` y ejecútalo en el SQL Editor de Supabase.

### 2. Integrar en la Aplicación

#### App.jsx - Agregar inicialización y rutas

```javascript
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSupabaseVideoCallStore } from './store/useSupabaseVideoCallStore';
import SupabaseVideoCallModal from './components/SupabaseVideoCallModal';
import SupabaseVideoCallPage from './pages/SupabaseVideoCallPage';

function App() {
  const initializeVideoCallService = useSupabaseVideoCallStore(state => state.initializeService);
  
  useEffect(() => {
    // Inicializar servicio de videollamadas cuando el usuario esté autenticado
    if (authUser) {
      initializeVideoCallService();
    }
  }, [authUser]);

  return (
    <>
      {/* Modal de llamadas entrantes */}
      <SupabaseVideoCallModal />
      
      {/* Rutas */}
      <Routes>
        {/* ... otras rutas ... */}
        <Route path="/video-call" element={<SupabaseVideoCallPage />} />
      </Routes>
    </>
  );
}
```

#### ChatHeader.jsx - Agregar botón de videollamada

```javascript
import { Video } from 'lucide-react';
import { useSupabaseVideoCallStore } from '../store/useSupabaseVideoCallStore';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ selectedUser }) => {
  const navigate = useNavigate();
  const initiateCall = useSupabaseVideoCallStore(state => state.initiateCall);
  
  const handleVideoCall = async () => {
    await initiateCall(selectedUser, 'video');
    navigate('/video-call');
  };

  return (
    <div className="chat-header">
      {/* ... resto del header ... */}
      
      {/* Botón de videollamada */}
      <button
        onClick={handleVideoCall}
        className="btn btn-circle btn-ghost"
        title="Iniciar videollamada"
      >
        <Video className="w-5 h-5" />
      </button>
    </div>
  );
};
```

### 3. Configuración de Electron

Los handlers para permisos de medios ya están configurados en `electron/main.js`:

- `request-media-permission`: Solicita permisos de cámara/micrófono
- `get-desktop-sources`: Obtiene fuentes para compartir pantalla
- `check-media-permissions`: Verifica estado de permisos

### 4. Variables de Entorno

Asegúrate de tener configuradas las variables de Supabase:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## 📋 Flujo de Videollamada

### Iniciar Llamada

1. Usuario A hace clic en el botón de videollamada
2. Se crea un registro en `video_calls` con estado 'pending'
3. Se obtiene el stream local (cámara/micrófono)
4. Se crea la oferta WebRTC y se envía a través de `webrtc_signals`
5. Usuario B recibe notificación de llamada entrante

### Recibir Llamada

1. Usuario B ve el modal de llamada entrante
2. Si acepta, se actualiza el estado a 'connecting'
3. Se obtiene el stream local
4. Se procesa la oferta y se envía respuesta
5. Se intercambian candidatos ICE

### Durante la Llamada

- Toggle video/audio
- Compartir pantalla (usando Electron desktop capture)
- Ver estado de conexión
- Pantalla completa

### Finalizar Llamada

1. Se actualiza el estado a 'ended'
2. Se limpian los streams
3. Se cierra la conexión WebRTC

## 🔧 Características Técnicas

### WebRTC

- **STUN Servers**: Configurados servidores públicos de Google
- **ICE Candidates**: Intercambio automático a través de Supabase
- **Renegociación**: Soporte para cambios durante la llamada (compartir pantalla)

### Supabase Realtime

- **Canales**: Suscripción a cambios en tablas
- **Filtros**: Solo recibe eventos relevantes para el usuario
- **RLS**: Políticas de seguridad para proteger datos

### Electron

- **Permisos nativos**: Manejo especial en macOS
- **Desktop Capture**: Acceso a pantallas y ventanas
- **Seguridad**: Context isolation y APIs expuestas controladas

## 🛡️ Seguridad

### Row Level Security (RLS)

- Usuarios solo pueden ver sus propias llamadas
- Solo el receptor puede aceptar/rechazar llamadas
- Señales WebRTC protegidas por usuario

### Limpieza Automática

- Función para limpiar señales antiguas (>1 hora)
- Llamadas pendientes se marcan como terminadas después de 5 minutos

## 🐛 Solución de Problemas

### "No se puede acceder a la cámara"

**En Electron:**
- macOS: Verificar permisos del sistema
- Windows: Verificar configuración de privacidad

**En navegador:**
- Verificar HTTPS (requerido para getUserMedia)
- Revisar permisos del navegador

### "La llamada no se conecta"

- Verificar conexión a Supabase Realtime
- Revisar firewall/NAT
- Verificar que ambos usuarios estén online

### "No funciona compartir pantalla"

**En Electron:**
- Verificar que `desktopCapturer` esté disponible
- En macOS, verificar permisos de grabación de pantalla

**En navegador:**
- Solo funciona en contexto seguro (HTTPS)
- No disponible en todos los navegadores móviles

## 📊 Monitoreo

### Logs del Sistema

```javascript
// Habilitar logs detallados
localStorage.setItem('debug', 'supabase:*');
```

### Métricas Recomendadas

- Tiempo de establecimiento de conexión
- Calidad de video/audio (bitrate)
- Latencia de señalización
- Tasa de éxito de llamadas

## 🚀 Mejoras Futuras

1. **Servidores TURN**
   - Agregar para mejor conectividad tras firewalls

2. **Llamadas Grupales**
   - Implementar SFU (Selective Forwarding Unit)
   - O usar mesh para grupos pequeños

3. **Grabación**
   - Usar MediaRecorder API
   - Almacenar en Supabase Storage

4. **Chat durante llamada**
   - DataChannel de WebRTC
   - Overlay de mensajes

5. **Efectos de Video**
   - Filtros con Canvas API
   - Difuminado de fondo con TensorFlow.js

## 📝 Comandos Útiles

```bash
# Ejecutar migraciones de Supabase
supabase db push supabase-videocalls-setup.sql

# Ver logs de Supabase Realtime
supabase logs --tail

# Limpiar señales antiguas manualmente
SELECT cleanup_old_webrtc_signals();

# Ver llamadas activas
SELECT * FROM get_active_calls('user_id_aqui');
```

## 🎯 Checklist de Implementación

- [ ] Ejecutar script SQL en Supabase
- [ ] Importar servicios y stores en la app
- [ ] Agregar componentes UI
- [ ] Configurar rutas
- [ ] Inicializar servicio al autenticar
- [ ] Agregar botón de videollamada
- [ ] Probar en Electron
- [ ] Configurar TURN servers (producción)
- [ ] Implementar grabación (opcional)
- [ ] Agregar analytics (opcional)

## 💡 Tips de Desarrollo

1. **Desarrollo Local**: Usa `ngrok` para HTTPS local
2. **Testing**: Abre dos ventanas/pestañas para probar
3. **Debugging**: Chrome DevTools para WebRTC internals
4. **Performance**: Limita resolución en conexiones lentas

---

¡El sistema de videollamadas con Supabase está listo para usar! 🎉
