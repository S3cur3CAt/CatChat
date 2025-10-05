# 🚀 Migración Completa a Supabase

Esta guía te ayudará a migrar CatChat de un backend local con Tailscale a una arquitectura completamente basada en Supabase.

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Migración del Código](#migración-del-código)
4. [Pruebas](#pruebas)
5. [Despliegue](#despliegue)

---

## 1. Preparación

### Requisitos Previos

- Cuenta de Supabase (gratis en [supabase.com](https://supabase.com))
- Node.js instalado
- Proyecto CatChat actual

### Ventajas de la Migración

✅ **Sin backend local**: No necesitas ejecutar servidores Node.js  
✅ **Sin Tailscale**: Conexión directa a Supabase desde cualquier lugar  
✅ **Escalabilidad**: Supabase maneja la carga automáticamente  
✅ **Gratis**: Plan gratuito generoso de Supabase  
✅ **Realtime**: WebSockets nativos para mensajería instantánea  

---

## 2. Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda las credenciales:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: `eyJhbGci...`

### Paso 2: Ejecutar Migraciones SQL

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase-migration-complete.sql`
3. Ejecuta el script (botón "Run")
4. Verifica que se crearon las tablas:
   - `profiles`
   - `conversations`
   - `conversation_members`
   - `messages`
   - `user_status`
   - `typing_events`

### Paso 3: Configurar Storage

1. Ve a **Storage** en el dashboard
2. Crea un bucket llamado `messages`
3. Marca como **Public**
4. Configura políticas:

```sql
-- Permitir subir imágenes
CREATE POLICY "Users can upload message images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'messages' AND 
    auth.uid() IS NOT NULL
  );

-- Permitir ver imágenes
CREATE POLICY "Anyone can view message images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'messages');
```

### Paso 4: Habilitar Realtime

1. Ve a **Database** → **Replication**
2. Habilita Realtime para las tablas:
   - ✅ `messages`
   - ✅ `user_status`
   - ✅ `typing_events`
   - ✅ `profiles`

---

## 3. Migración del Código

### Paso 1: Actualizar Variables de Entorno

Crea/actualiza `.env` en la raíz del proyecto:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

### Paso 2: Reemplazar Archivos

#### Frontend

1. **Reemplazar `useAuthStore.js`**:
   ```bash
   mv frontend/src/store/useAuthStore-supabase.js frontend/src/store/useAuthStore.js
   ```

2. **Reemplazar `useChatStore.js`**:
   ```bash
   mv frontend/src/store/useChatStore-supabase.js frontend/src/store/useChatStore.js
   ```

3. **Actualizar `useRealtimeStore.js`** (ya está actualizado)

#### Electron

1. **Reemplazar `main.js`**:
   ```bash
   mv electron/main-supabase.js electron/main.js
   ```

2. **Reemplazar `preload.js`**:
   ```bash
   mv electron/preload-supabase.js electron/preload.js
   ```

### Paso 3: Actualizar `package.json` de Electron

Edita `electron/package.json`:

```json
{
  "name": "catchat-electron",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder"
  },
  "dependencies": {},
  "devDependencies": {
    "electron": "^27.3.11",
    "electron-builder": "^24.13.3"
  }
}
```

**Ya no necesitas**:
- ❌ `express`
- ❌ `socket.io`
- ❌ `dotenv`
- ❌ `bcryptjs`
- ❌ `jsonwebtoken`
- ❌ Dependencias del backend

### Paso 4: Limpiar Archivos Obsoletos

Puedes eliminar (o mover a una carpeta `_backup`):

```bash
# Backend completo (ya no se usa)
mv backend _backup/backend

# Archivos de Tailscale
mv check-tailscale.bat _backup/
mv conectar-tailscale.bat _backup/
mv TAILSCALE-AUTO.md _backup/
```

---

## 4. Pruebas

### Paso 1: Probar en Desarrollo

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Electron
cd electron
npm start
```

### Paso 2: Verificar Funcionalidades

✅ **Registro de usuario**: Crear cuenta nueva  
✅ **Login**: Iniciar sesión  
✅ **Mensajería**: Enviar/recibir mensajes en tiempo real  
✅ **Estados online/offline**: Ver quién está conectado  
✅ **Notificaciones**: Recibir notificaciones de mensajes  
✅ **Imágenes**: Enviar imágenes en el chat  

### Paso 3: Verificar Realtime

1. Abre dos ventanas de la app (o dos navegadores)
2. Inicia sesión con usuarios diferentes
3. Envía un mensaje desde una ventana
4. Verifica que aparece instantáneamente en la otra

---

## 5. Despliegue

### Opción A: Electron App (Recomendado)

```bash
cd electron
npm run build
```

El instalador estará en `electron/dist/`

### Opción B: Web App

Puedes desplegar el frontend en:

- **Vercel**: 
  ```bash
  cd frontend
  npm run build
  vercel --prod
  ```

- **Netlify**:
  ```bash
  cd frontend
  npm run build
  netlify deploy --prod --dir=dist
  ```

---

## 📊 Comparación: Antes vs Después

### Antes (Backend Local + Tailscale)

❌ Requiere backend Node.js corriendo  
❌ Necesita Tailscale instalado  
❌ Problemas de conectividad P2P  
❌ Configuración compleja  
❌ Solo funciona en red local o con VPN  

### Después (Supabase)

✅ Sin backend local  
✅ Sin VPN necesaria  
✅ Funciona desde cualquier lugar  
✅ Configuración simple  
✅ Escalable automáticamente  
✅ Gratis hasta 500MB de DB  

---

## 🔧 Troubleshooting

### Error: "Failed to fetch"

**Causa**: Supabase URL o API Key incorrectas  
**Solución**: Verifica las credenciales en `frontend/src/lib/supabase.js`

### Error: "Row Level Security policy violation"

**Causa**: Políticas RLS mal configuradas  
**Solución**: Revisa que ejecutaste todo el script SQL de migración

### Mensajes no llegan en tiempo real

**Causa**: Realtime no habilitado  
**Solución**: Ve a Database → Replication y habilita las tablas

### Imágenes no se suben

**Causa**: Bucket o políticas de Storage mal configuradas  
**Solución**: Verifica que el bucket `messages` existe y es público

---

## 📝 Notas Importantes

1. **Migración de datos**: Si tienes datos existentes, necesitarás migrarlos manualmente a Supabase
2. **Autenticación**: Los usuarios deberán registrarse nuevamente (las contraseñas antiguas no son compatibles)
3. **Costos**: El plan gratuito de Supabase incluye:
   - 500MB de base de datos
   - 1GB de almacenamiento de archivos
   - 2GB de ancho de banda
   - 50,000 usuarios activos mensuales

---

## 🎉 ¡Listo!

Tu aplicación CatChat ahora funciona completamente con Supabase, sin necesidad de backend local ni Tailscale.

### Próximos Pasos

- [ ] Personalizar el diseño
- [ ] Agregar más funcionalidades (videollamadas, grupos, etc.)
- [ ] Configurar dominio personalizado
- [ ] Monitorear uso en el dashboard de Supabase

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs del navegador (F12 → Console)
2. Revisa los logs de Supabase (Dashboard → Logs)
3. Verifica las políticas RLS (Dashboard → Authentication → Policies)

---

**¡Disfruta tu nueva app sin complicaciones!** 🚀
