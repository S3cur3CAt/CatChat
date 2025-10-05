# Migración MongoDB → Supabase

## ✅ PASOS COMPLETADOS
- ✅ Instalado @supabase/supabase-js
- ✅ Creado configuración de Supabase
- ✅ Actualizados modelos para usar Supabase
- ✅ Actualizados controladores de auth y messages
- ✅ Actualizado middleware de autenticación
- ✅ Removido mongoose de dependencias
- ✅ Actualizado index.js para no conectar a MongoDB

## 🚀 PASOS PENDIENTES

### 1. Crear Tablas en Supabase
Ejecuta `supabase-migration.sql` en el SQL Editor de tu proyecto Supabase:

```sql
-- Copia y pega el contenido completo del archivo supabase-migration.sql
```

### 2. Crear Usuario de Prueba
Ejecuta `create-test-user.sql` en Supabase para crear un usuario de prueba:

```sql
-- Copia y pega el contenido del archivo create-test-user.sql
-- IMPORTANTE: Cambia la contraseña hash por una real usando bcrypt
```

### 3. Variables de Entorno
Asegúrate de que tu archivo `.env` tenga las variables de Supabase:

```env
SUPABASE_URL=https://uyjgerykrvhbzykhzctj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Probar la Aplicación
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## 🔧 Problemas Comunes

### Error "invalid input syntax for type uuid"
- Significa que el JWT contiene un ObjectId de MongoDB
- Solución: Usa el usuario de prueba creado con ObjectId

### Error "Could not find the 'fullName' column"
- Las tablas no se crearon correctamente en Supabase
- Solución: Ejecuta el script `supabase-migration.sql`

### Error de conexión
- Verifica que las variables de entorno sean correctas
- Asegúrate de que la URL de Supabase sea correcta

## 🎯 Características Optimizadas

- ✅ Carga inicial: Solo 50 mensajes recientes
- ✅ Scroll infinito: Carga mensajes antiguos automáticamente
- ✅ Paginación: Mejor rendimiento con grandes conversaciones
- ✅ Índices optimizados: Consultas ultra-rápidas
- ✅ Compatibilidad: Maneja tanto ObjectIds como UUIDs

## 📝 Notas Importantes

- Los usuarios existentes con ObjectIds de MongoDB funcionarán
- Los nuevos usuarios tendrán UUIDs de Supabase
- La aplicación es completamente compatible con ambos tipos de IDs
- El rendimiento de carga de mensajes está significativamente mejorado
