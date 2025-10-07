import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('0 MB/s');
  const [bytesDownloaded, setBytesDownloaded] = useState('0 MB');
  const [totalBytes, setTotalBytes] = useState('0 MB');
  const [updateVersion, setUpdateVersion] = useState('');

  useEffect(() => {
    // Verificar si estamos en Electron
    const isElectron = window.electronAPI !== undefined;

    if (!isElectron) return;

    // Escuchar eventos de actualización desde el proceso principal
    const handleUpdateAvailable = (event, info) => {
      console.log('🎉 Actualización disponible:', info);
      setUpdateAvailable(true);
      setUpdateVersion(info.version || 'nueva versión');
    };

    const handleDownloadProgress = (event, progressInfo) => {
      console.log('📥 Progreso de descarga:', progressInfo);
      setDownloadProgress(Math.round(progressInfo.percent || 0));
      
      // Convertir bytes a MB
      const mbDownloaded = (progressInfo.transferred / 1024 / 1024).toFixed(1);
      const mbTotal = (progressInfo.total / 1024 / 1024).toFixed(1);
      const mbSpeed = (progressInfo.bytesPerSecond / 1024 / 1024).toFixed(2);
      
      setBytesDownloaded(mbDownloaded);
      setTotalBytes(mbTotal);
      setDownloadSpeed(`${mbSpeed} MB/s`);
    };

    const handleUpdateDownloaded = () => {
      console.log('✅ Actualización descargada');
      setDownloading(false);
      setUpdateAvailable(false);
      
      // Mostrar notificación de reinicio
      setTimeout(() => {
        if (window.confirm('La actualización está lista. ¿Deseas reiniciar ahora?')) {
          window.electronAPI.restartApp();
        }
      }, 500);
    };

    // Registrar listeners
    window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
    window.electronAPI.onDownloadProgress(handleDownloadProgress);
    window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);

    // Simular actualización disponible en desarrollo (solo para pruebas)
    if (!window.electronAPI || import.meta.env.DEV) {
      setTimeout(() => {
        console.log('🎮 Simulando actualización disponible para pruebas...');
        setUpdateAvailable(true);
        setUpdateVersion('1.2.0');
      }, 3000);
    }

    return () => {
      // Limpiar listeners si existen
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners?.('update-available');
        window.electronAPI.removeAllListeners?.('download-progress');
        window.electronAPI.removeAllListeners?.('update-downloaded');
      }
    };
  }, []);

  const handleUpdate = () => {
    setDownloading(true);
    setDownloadProgress(0);
    
    if (window.electronAPI) {
      // Iniciar descarga real en Electron
      window.electronAPI.downloadUpdate();
    } else {
      // Simulación para desarrollo
      simulateDownload();
    }
  };

  const simulateDownload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setDownloading(false);
          setUpdateAvailable(false);
          alert('✅ Actualización instalada (simulación)');
        }, 500);
      }
      setDownloadProgress(Math.min(progress, 100));
      
      // Simular velocidad y bytes
      const speed = (Math.random() * 10 + 2).toFixed(2);
      setDownloadSpeed(`${speed} MB/s`);
      setBytesDownloaded((progress * 1.5).toFixed(1));
      setTotalBytes('150.0');
    }, 300);
  };

  // No mostrar nada si no hay actualización
  if (!updateAvailable && !downloading) return null;

  return (
    <AnimatePresence>
      {(updateAvailable || downloading) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute bottom-full left-0 right-0 mb-2 z-50"
        >
          <div className="mx-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-2xl overflow-hidden">
            {!downloading ? (
              // Notificación de actualización disponible
              <motion.div
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Icono animado de gato */}
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <svg className="w-8 h-8 text-white" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="45" r="15" className="fill-white/90"/>
                      <path d="M 35 40 L 35 30 L 40 35 Z M 65 40 L 65 30 L 60 35 Z" className="fill-white"/>
                      <circle cx="45" cy="45" r="2" className="fill-purple-600"/>
                      <circle cx="55" cy="45" r="2" className="fill-purple-600"/>
                      <path d="M 45 52 Q 50 55, 55 52" stroke="purple" strokeWidth="2" fill="none"/>
                      <motion.path
                        d="M 50 65 L 50 75"
                        stroke="white"
                        strokeWidth="2"
                        animate={{ pathLength: [0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.circle
                        cx="50"
                        cy="78"
                        r="3"
                        className="fill-white"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    </svg>
                  </motion.div>
                  
                  <div className="text-white">
                    <div className="text-sm font-semibold">
                      ¡Nueva actualización disponible!
                    </div>
                    <div className="text-xs opacity-90">
                      Versión {updateVersion} lista para instalar
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdate}
                  className="px-4 py-1.5 bg-white text-purple-600 rounded-md font-semibold text-sm hover:bg-white/90 transition-colors"
                >
                  Update
                </motion.button>
              </motion.div>
            ) : (
              // Barra de progreso de descarga
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Icono de descarga animado */}
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </motion.div>
                    
                    <div className="text-white text-sm">
                      {downloadProgress < 100 ? 'Descargando actualización...' : 'Instalando...'}
                    </div>
                  </div>
                  
                  <div className="text-white text-sm font-mono">
                    {downloadProgress}%
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="relative h-6 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/80 to-white rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${downloadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Efecto de brillo animado */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  {/* Texto dentro de la barra */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-md">
                      {downloadProgress < 100 && (
                        <>
                          {bytesDownloaded} MB / {totalBytes} MB
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Velocidad de descarga */}
                {downloadProgress < 100 && (
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-white/70">
                      Velocidad: {downloadSpeed}
                    </div>
                    <div className="text-xs text-white/70">
                      {Math.ceil((100 - downloadProgress) / 10)}s restantes
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;
