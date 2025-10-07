const { app, BrowserWindow, ipcMain, shell, Notification, Menu, desktopCapturer, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');
const AppUpdater = require('./updater');

// Configuración: detectar si es desarrollo o producción
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Variables globales
let mainWindow;
let splashWindow;
let appUpdater;

// Configuración de Supabase (se pasa al frontend)
global.supabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://uyjgerykrvhbzykhzctj.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5amdlcnlrcnZoYnp5a2h6Y3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njc3NDksImV4cCI6MjA3NDU0Mzc0OX0.cEPDFrI9Nm7hXz0JaJ_TeAB0CaxfGE9nXAV6_3DoEGE'
};

// Configurar ruta del frontend
function getFrontendPath() {
  // SIEMPRE usar el build de frontend/dist
  const distPath = path.join(__dirname, '../frontend/dist');
  
  if (fs.existsSync(distPath)) {
    const indexPath = path.join(distPath, 'index.html');
    console.log('📁 Cargando desde build:', indexPath);
    return `file://${indexPath}`;
  } else {
    console.error('❌ Frontend dist no encontrado:', distPath);
    console.error('❌ Ejecuta: cd frontend && npm run build');
    return null;
  }
}

// Crear menú de la aplicación
function createMenu() {
  const template = [
    {
      label: 'CatChat',
      submenu: [
        {
          label: 'Acerca de CatChat',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de CatChat',
              message: 'CatChat',
              detail: `Versión: ${app.getVersion()}\n\nAplicación de chat con videollamadas.\n\nDesarrollado con ❤️ usando Electron, React y Supabase.`,
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Buscar Actualizaciones...',
          click: () => {
            if (appUpdater) {
              appUpdater.checkForUpdates(true);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'Ctrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        {
          label: 'Forzar Recarga',
          accelerator: 'Ctrl+Shift+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reloadIgnoringCache();
          }
        },
        { type: 'separator' },
        {
          label: 'Herramientas de Desarrollo',
          accelerator: 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Pantalla Completa',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Documentación',
          click: () => {
            shell.openExternal('https://github.com/S3cur3CAt/CatChat/wiki');
          }
        },
        {
          label: 'Reportar un Problema',
          click: () => {
            shell.openExternal('https://github.com/S3cur3CAt/CatChat/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'Ver Logs',
          click: () => {
            const logPath = path.join(app.getPath('userData'), 'logs');
            shell.openPath(logPath);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Crear ventana splash
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const splashPath = path.join(__dirname, 'splash.html');
  splashWindow.loadFile(splashPath);
  
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

// Crear ventana principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // No mostrar hasta que esté lista
    frame: false, // Sin barra de título nativa
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const frontendPath = getFrontendPath();
  
  if (!frontendPath) {
    console.error('❌ No se puede cargar el frontend. Asegúrate de ejecutar: npm run build');
    app.quit();
    return;
  }
  
  console.log('🎯 Cargando frontend desde:', frontendPath);
  mainWindow.loadURL(frontendPath);

  // Abrir DevTools en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Ventana principal lista');
    
    // Cerrar splash y mostrar ventana principal
    if (splashWindow) {
      splashWindow.close();
    }
    
    mainWindow.show();
    mainWindow.focus();
  });

  // Abrir enlaces externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers

// Controles de ventana
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// Sistema de actualizaciones
ipcMain.on('download-update', () => {
  console.log('📥 Iniciando descarga de actualización...');
  if (appUpdater) {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.downloadUpdate();
  }
});

ipcMain.on('restart-app', () => {
  console.log('🔄 Reiniciando aplicación para aplicar actualización...');
  if (appUpdater) {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.quitAndInstall();
  }
});

ipcMain.handle('is-window-focused', () => {
  return mainWindow ? mainWindow.isFocused() : false;
});

// Notificaciones nativas
ipcMain.handle('show-notification', (event, title, body, icon) => {
  console.log('🔔 Mostrando notificación:', { title, body });
  
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      icon: icon || path.join(__dirname, 'assets', 'icon.png'),
      silent: false
    });
    
    notification.show();
    
    notification.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
    
    return true;
  }
  
  return false;
});

// Obtener configuración de Supabase
ipcMain.handle('get-supabase-config', () => {
  return global.supabaseConfig;
});

// Handlers para videollamadas
ipcMain.handle('request-media-permission', async () => {
  console.log('📹 Solicitando permisos de medios');
  
  if (process.platform === 'darwin') {
    // En macOS, verificar y solicitar permisos
    const cameraAccess = systemPreferences.getMediaAccessStatus('camera');
    const micAccess = systemPreferences.getMediaAccessStatus('microphone');
    
    if (cameraAccess !== 'granted') {
      await systemPreferences.askForMediaAccess('camera');
    }
    if (micAccess !== 'granted') {
      await systemPreferences.askForMediaAccess('microphone');
    }
    
    return cameraAccess === 'granted' && micAccess === 'granted';
  }
  
  // En Windows y Linux, los permisos se manejan en el navegador
  return true;
});

ipcMain.handle('get-desktop-sources', async () => {
  console.log('🖥️ Obteniendo fuentes de escritorio');
  
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 300, height: 200 }
    });
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
      display_id: source.display_id,
      appIcon: source.appIcon ? source.appIcon.toDataURL() : null
    }));
  } catch (error) {
    console.error('❌ Error obteniendo fuentes:', error);
    return [];
  }
});

ipcMain.handle('get-media-devices', async () => {
  console.log('🎤 Obteniendo dispositivos de medios');
  
  // Esta información se obtiene mejor desde el renderer
  // pero podemos proporcionar información básica
  return {
    hasCamera: true,
    hasMicrophone: true
  };
});

ipcMain.handle('check-media-permissions', async () => {
  console.log('🔍 Verificando permisos de medios');
  
  if (process.platform === 'darwin') {
    const cameraAccess = systemPreferences.getMediaAccessStatus('camera');
    const micAccess = systemPreferences.getMediaAccessStatus('microphone');
    
    return {
      camera: cameraAccess === 'granted',
      microphone: micAccess === 'granted'
    };
  }
  
  // En Windows y Linux, asumimos que están disponibles
  return {
    camera: true,
    microphone: true
  };
});

// Ciclo de vida de la aplicación
app.whenReady().then(async () => {
  console.log('🚀 Electron app iniciando...');
  console.log('📦 Modo:', isDev ? 'Desarrollo' : 'Producción');
  console.log('🔗 Supabase URL:', global.supabaseConfig.url);
  
  // Crear menú de la aplicación
  createMenu();
  
  // Crear splash primero
  createSplashWindow();
  
  // Pequeño delay para que se vea el splash
  setTimeout(() => {
    createMainWindow();
    
    // Inicializar actualizador solo en producción
    if (!isDev && mainWindow) {
      console.log('🔄 Inicializando sistema de actualizaciones...');
      appUpdater = new AppUpdater(mainWindow);
      appUpdater.startAutoCheck(); // Verificar actualizaciones automáticamente
    }
  }, 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('🚫 Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚫 Promesa rechazada no manejada:', reason);
});

console.log('✅ Electron main process configurado (Supabase mode)');
