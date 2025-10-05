# 📦 Instalador de Electron para CatChat

Este documento explica cómo crear un instalador de Electron para la aplicación CatChat.

## 🚀 Construcción Rápida

Para crear el instalador ejecuta:

```bash
node build-electron.js
```

Este script automatiza todo el proceso de construcción.

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **npm** (incluido con Node.js)
- **Windows** (para crear instaladores .exe)

## 🏗️ Proceso de Construcción Manual

Si prefieres hacerlo paso a paso:

### 1. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install

# Electron
cd ../electron
npm install
```

### 2. Construir Frontend

```bash
cd frontend
npm run build
```

### 3. Crear Instalador

```bash
cd electron
npm run build-win
```

## 📁 Estructura de Archivos

```
electron/
├── main.js              # Proceso principal de Electron
├── preload.js           # Script de precarga seguro
├── splash.html          # Pantalla de carga
├── installer.nsh        # Script personalizado NSIS
├── package.json         # Configuración de electron-builder
└── assets/
    ├── icon.png         # Icono principal
    ├── icon.ico         # Icono Windows
    └── icon.icns        # Icono macOS
```

## 🎯 Tipos de Instaladores

El script genera dos tipos:

### 📦 Instalador NSIS (.exe)
- **Ubicación**: `electron/dist/CatChat Setup 1.0.0.exe`
- **Características**:
  - Instalación guiada
  - Accesos directos automáticos
  - Configuración de firewall
  - Desinstalador incluido

### 💼 Versión Portable (.exe)
- **Ubicación**: `electron/dist/CatChat-Portable.exe`
- **Características**:
  - No requiere instalación
  - Ejecutable único
  - Ideal para USB o carpetas temporales

## ⚙️ Configuración del Instalador

### Firewall Automático
El instalador configura automáticamente:
- Reglas de firewall para la aplicación
- Puerto 5001 para el backend
- Permisos de entrada y salida

### Características Incluidas
- ✅ **Servidor integrado**: Backend incluido en la aplicación
- ✅ **LocalTunnel**: Túnel público automático
- ✅ **Splash screen**: Pantalla de carga moderna
- ✅ **Ventana sin frame**: Controles personalizados
- ✅ **Actualizaciones**: Preparado para auto-updates

## 🔧 Personalización

### Cambiar Iconos
1. Reemplaza los archivos en `electron/assets/`
2. Usa imágenes de alta resolución (512x512 px)
3. Formatos: PNG, ICO, ICNS

### Modificar Instalador
Edita `electron/installer.nsh` para:
- Cambiar mensajes del instalador
- Agregar configuraciones adicionales
- Modificar reglas de firewall

### Configurar Firma Digital
En `electron/package.json`, sección `build.win`:
```json
"certificateFile": "path/to/certificate.p12",
"certificatePassword": "password"
```

## 🚨 Solución de Problemas

### Error: "electron-builder not found"
```bash
cd electron
npm install electron-builder --save-dev
```

### Error: "Cannot find module"
Ejecuta el script completo:
```bash
node build-electron.js
```

### Instalador muy grande
El instalador incluye:
- Frontend compilado (~5-10 MB)
- Backend con dependencias (~50-100 MB)
- Runtime de Electron (~150 MB)

### Firewall bloquea la aplicación
El instalador debería configurarlo automáticamente, pero puedes hacerlo manualmente:
1. Windows Defender Firewall
2. Permitir una aplicación
3. Agregar CatChat.exe

## 📊 Tamaños Esperados

- **Instalador NSIS**: ~180-250 MB
- **Versión Portable**: ~200-280 MB
- **Aplicación instalada**: ~300-400 MB

## 🎉 Distribución

Una vez generado, puedes distribuir:
1. **CatChat Setup.exe** - Para instalación tradicional
2. **CatChat-Portable.exe** - Para uso sin instalación

Los usuarios podrán:
- Instalar y ejecutar la aplicación
- Crear salas de chat automáticamente
- Compartir URLs públicas con LocalTunnel
- Hacer videollamadas sin configuración adicional

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en la consola
2. Verifica que todos los puertos estén libres
3. Asegúrate de tener permisos de administrador
4. Consulta la documentación de electron-builder
