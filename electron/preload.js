const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Controles de ventana
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Notificaciones
  showNotification: (title, body, icon) => 
    ipcRenderer.invoke('show-notification', title, body, icon),
  isWindowFocused: () => ipcRenderer.invoke('is-window-focused'),
  
  // Configuración de Supabase
  getSupabaseConfig: () => ipcRenderer.invoke('get-supabase-config'),
  
  // Sistema de actualizaciones
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  restartApp: () => ipcRenderer.send('restart-app'),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Información del sistema
  platform: process.platform,
  isElectron: true,
  
  // APIs para videollamadas
  requestMediaPermission: () => ipcRenderer.invoke('request-media-permission'),
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  getMediaDevices: () => ipcRenderer.invoke('get-media-devices'),
  checkMediaPermissions: () => ipcRenderer.invoke('check-media-permissions')
});

// Prevenir el uso de Node.js APIs en el renderer
delete window.require;
delete window.exports;
delete window.module;
