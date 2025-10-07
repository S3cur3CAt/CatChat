const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class AppUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.updateWindow = null;
    
    // Configurar el auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    
    // Configurar los event listeners
    this.setupEventListeners();
    
    // Configurar logger para debugging
    autoUpdater.logger = require('electron-log');
    autoUpdater.logger.transports.file.level = 'info';
  }

  setupEventListeners() {
    // Cuando se detecta una actualización disponible
    autoUpdater.on('update-available', (info) => {
      console.log('Actualización disponible:', info);
      
      // Enviar evento al renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-available', info);
      }
    });

    // Cuando no hay actualizaciones disponibles
    autoUpdater.on('update-not-available', () => {
      console.log('No hay actualizaciones disponibles');
      
      // Solo mostrar si el usuario lo solicitó manualmente
      if (this.manualCheck) {
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'Sin Actualizaciones',
          message: 'CatChat está actualizado',
          detail: 'Ya tienes la última versión instalada.'
        });
        this.manualCheck = false;
      }
    });

    // Error al buscar actualizaciones
    autoUpdater.on('error', (err) => {
      console.error('Error en actualización:', err);
      
      if (this.updateWindow) {
        this.updateWindow.close();
        this.updateWindow = null;
      }
      
      dialog.showErrorBox(
        'Error de Actualización',
        'Ha ocurrido un error al buscar actualizaciones.\n\n' + err.message
      );
    });

    // Progreso de descarga
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Velocidad: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Descargado ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      console.log(log_message);
      
      // Enviar progreso al renderer principal
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('download-progress', progressObj);
        // Actualizar la barra de progreso de Windows
        this.mainWindow.setProgressBar(progressObj.percent / 100);
      }
      
      // Enviar progreso a la ventana de actualización (si existe)
      if (this.updateWindow && !this.updateWindow.isDestroyed()) {
        this.updateWindow.webContents.send('download-progress', progressObj);
      }
    });

    // Actualización descargada
    autoUpdater.on('update-downloaded', (info) => {
      console.log('Actualización descargada');
      
      // Quitar la barra de progreso
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setProgressBar(-1);
      }
      
      // Cerrar ventana de actualización
      if (this.updateWindow && !this.updateWindow.isDestroyed()) {
        this.updateWindow.close();
        this.updateWindow = null;
      }
      
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Actualización Lista',
        message: 'La actualización ha sido descargada.',
        detail: 'La aplicación se reiniciará para aplicar los cambios.',
        buttons: ['Reiniciar Ahora', 'Reiniciar Más Tarde'],
        defaultId: 0,
        cancelId: 1
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }

  // Crear ventana de progreso de actualización
  showUpdateWindow() {
    if (this.updateWindow) return;
    
    this.updateWindow = new BrowserWindow({
      width: 400,
      height: 200,
      parent: this.mainWindow,
      modal: true,
      frame: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    // Crear HTML inline para la ventana de actualización
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 20px;
          }
          .container {
            text-align: center;
            width: 100%;
          }
          h2 {
            margin-bottom: 10px;
            font-size: 18px;
          }
          .status {
            font-size: 14px;
            margin-bottom: 20px;
            opacity: 0.9;
          }
          .progress-bar {
            width: 100%;
            height: 30px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
            border-radius: 15px;
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
          }
          .bytes-info {
            font-size: 12px;
            opacity: 0.8;
          }
          .cat-animation {
            width: 50px;
            height: 50px;
            margin: 0 auto 20px;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .cat-animation svg {
            animation: bounce 1s ease-in-out infinite;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="cat-animation">
            <svg viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="20" fill="white" opacity="0.9"/>
              <path d="M 30 40 L 30 30 L 38 36 Z M 70 40 L 70 30 L 62 36 Z" fill="white"/>
              <circle cx="40" cy="48" r="3" fill="#667eea"/>
              <circle cx="60" cy="48" r="3" fill="#667eea"/>
              <path d="M 45 58 Q 50 62, 55 58" stroke="#667eea" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <h2>Descargando Actualización...</h2>
          <div class="status" id="status">Preparando descarga...</div>
          <div class="progress-bar">
            <div class="progress-fill" id="progress" style="width: 0%">0%</div>
          </div>
          <div class="bytes-info" id="bytes-info"></div>
        </div>
        
        <script>
          const { ipcRenderer } = require('electron');
          
          ipcRenderer.on('download-progress', (event, progressObj) => {
            const percent = Math.round(progressObj.percent);
            document.getElementById('progress').style.width = percent + '%';
            document.getElementById('progress').textContent = percent + '%';
            document.getElementById('status').textContent = 'Descargando actualización...';
            
            const mb = (size) => (size / 1024 / 1024).toFixed(2);
            const speed = (progressObj.bytesPerSecond / 1024 / 1024).toFixed(2);
            document.getElementById('bytes-info').textContent = 
              mb(progressObj.transferred) + ' MB / ' + mb(progressObj.total) + ' MB • ' + speed + ' MB/s';
          });
        </script>
      </body>
      </html>
    `;

    this.updateWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);

    this.updateWindow.on('closed', () => {
      this.updateWindow = null;
    });
  }

  // Verificar actualizaciones manualmente
  checkForUpdates(manual = false) {
    this.manualCheck = manual;
    autoUpdater.checkForUpdatesAndNotify();
  }

  // Iniciar verificación automática
  startAutoCheck(interval = 3600000) { // Por defecto cada hora
    // Verificar al iniciar
    setTimeout(() => {
      this.checkForUpdates(false);
    }, 5000); // Esperar 5 segundos después del inicio
    
    // Verificar periódicamente
    setInterval(() => {
      this.checkForUpdates(false);
    }, interval);
  }
}

module.exports = AppUpdater;
