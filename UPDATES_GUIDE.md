# 🔄 Guía de Actualizaciones Automáticas - CatChat

## 📋 Configuración Inicial

### 1. Preparar tu Repositorio de GitHub

1. **Crear repositorio en GitHub**:
   ```bash
   # Si aún no tienes un repositorio
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/S3cur3CAt/CatChat.git
   git push -u origin main
   ```

2. **Configuración ya lista** ✅:
   - El `electron/package.json` ya está configurado con tu usuario:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/S3cur3CAt/CatChat.git"
   },
   "publish": [
     {
       "provider": "github",
       "owner": "S3cur3CAt",
       "repo": "CatChat"
     }
   ]
   ```

### 2. Generar Token de GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Genera un nuevo token (classic) con el scope `repo`
3. Guarda el token de forma segura

### 3. Configurar Secrets en GitHub

1. En tu repositorio, ve a Settings → Secrets and variables → Actions
2. El `GITHUB_TOKEN` ya está disponible por defecto (no necesitas configurarlo)

## 🚀 Publicar una Nueva Versión

### 1. Actualizar la versión en package.json

```bash
# En la carpeta electron/
cd electron

# Actualizar versión (ejemplo: de 1.0.0 a 1.1.0)
# Edita electron/package.json manualmente o usa:
npm version minor
```

### 2. Crear un tag y publicar

```bash
# Commit de los cambios
git add .
git commit -m "Bump version to 1.1.0"

# Crear tag
git tag v1.1.0

# Subir cambios y tag
git push origin main
git push origin v1.1.0
```

### 3. GitHub Actions se encargará del resto

- El workflow se ejecutará automáticamente
- Construirá la aplicación para Windows, Linux y macOS
- Creará un Release en GitHub con todos los instaladores
- Los archivos `latest.yml` permitirán las actualizaciones automáticas

## 🔄 Cómo Funcionan las Actualizaciones

### Para los Usuarios

1. **Verificación automática**:
   - La app verifica actualizaciones cada hora
   - También al iniciar la aplicación (después de 5 segundos)

2. **Notificación de actualización**:
   - El usuario recibe una notificación cuando hay una nueva versión
   - Puede elegir descargar ahora o más tarde

3. **Descarga con progreso**:
   - Ventana bonita con animación de gato
   - Muestra el progreso de descarga en tiempo real
   - Velocidad de descarga y bytes transferidos

4. **Instalación**:
   - Opción de reiniciar ahora o más tarde
   - La actualización se instala al reiniciar la app

### Verificación Manual

Los usuarios pueden verificar actualizaciones manualmente desde:
- Menú → CatChat → Buscar Actualizaciones...

## 📁 Estructura de Archivos de Release

Cada release contendrá:

```
├── CatChat-Setup-1.1.0.exe        # Instalador Windows
├── CatChat-Setup-1.1.0.exe.blockmap
├── CatChat-Portable.exe           # Versión portable Windows
├── latest.yml                     # Metadatos para Windows
├── CatChat-1.1.0.AppImage        # Linux
├── latest-linux.yml               # Metadatos para Linux
├── CatChat-1.1.0.dmg             # macOS
├── CatChat-1.1.0.dmg.blockmap
└── latest-mac.yml                 # Metadatos para macOS
```

## 🛠️ Desarrollo y Testing

### Testing Local (Sin publicar)

1. **Construir localmente**:
   ```bash
   cd electron
   npm run build
   ```

2. **Simular servidor de actualizaciones**:
   ```bash
   # Servir los archivos dist/ localmente
   npx http-server dist/ -p 8080
   ```

3. **Configurar URL de prueba** (temporalmente en `updater.js`):
   ```javascript
   autoUpdater.setFeedURL({
     provider: 'generic',
     url: 'http://localhost:8080'
   });
   ```

### Logs de Depuración

Los logs de actualización se guardan en:
- Windows: `%APPDATA%/CatChat/logs/`
- macOS: `~/Library/Logs/CatChat/`
- Linux: `~/.config/CatChat/logs/`

## ⚙️ Configuración Avanzada

### Cambiar Intervalo de Verificación

En `electron/updater.js`:

```javascript
// Por defecto: cada hora (3600000 ms)
appUpdater.startAutoCheck(3600000);

// Cada 30 minutos
appUpdater.startAutoCheck(1800000);

// Cada 2 horas
appUpdater.startAutoCheck(7200000);
```

### Desactivar Actualizaciones Automáticas

En `electron/main.js`, comenta esta línea:

```javascript
// appUpdater.startAutoCheck();
```

### Personalizar Ventana de Actualización

Edita el HTML en `electron/updater.js` en la función `showUpdateWindow()` para personalizar:
- Colores
- Animaciones
- Mensajes
- Diseño

## 🚨 Solución de Problemas

### Error: "Cannot find module 'electron-updater'"

```bash
cd electron
npm install electron-updater
```

### Error: "GitHub Rate Limit"

- Espera una hora o usa un token de GitHub
- Configura el token en las variables de entorno

### Las actualizaciones no se detectan

1. Verifica que el tag esté publicado correctamente
2. Asegúrate de que el Release no esté marcado como "Draft"
3. Revisa los logs en la carpeta de logs de la aplicación

### Error de firma en macOS

Para macOS necesitarás certificados de desarrollador de Apple. Para desarrollo, puedes:
- Desactivar temporalmente la verificación de firma
- O distribuir solo para Windows/Linux

## 📝 Notas Importantes

1. **Versionado Semántico**: Usa siempre versionado semántico (MAJOR.MINOR.PATCH)
2. **Changelog**: Mantén un CHANGELOG.md actualizado con los cambios
3. **Testing**: Prueba las actualizaciones en un entorno de staging primero
4. **Rollback**: Guarda versiones anteriores por si necesitas hacer rollback
5. **Comunicación**: Notifica a los usuarios sobre cambios importantes

## 🎉 Características del Sistema de Actualizaciones

✅ **Actualizaciones automáticas silenciosas**
✅ **Notificaciones amigables al usuario**
✅ **Descarga con progreso visual**
✅ **Verificación periódica configurable**
✅ **Soporte multi-plataforma**
✅ **Actualizaciones incrementales con blockmap**
✅ **Rollback automático si falla la instalación**
✅ **Logs detallados para debugging**

## 💡 Tips

- Las actualizaciones solo funcionan en la app empaquetada (no en desarrollo)
- Los usuarios con la versión portable necesitan descargar manualmente
- Puedes crear releases "pre-release" para beta testing
- El sistema usa actualizaciones delta (solo descarga los cambios)
