import { useState, useEffect } from 'react';

const WindowControls = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Verificar si estamos en Electron
    setIsElectron(!!window.electronAPI);
  }, []);

  const minimizeWindow = () => {
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  };

  const maximizeWindow = () => {
    if (window.electronAPI?.maximizeWindow) {
      window.electronAPI.maximizeWindow();
    }
  };

  const closeWindow = () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    }
  };

  // Solo mostrar en Electron
  if (!isElectron) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex bg-black/20 backdrop-blur-sm border-b border-white/10">
      {/* Barra de título arrastrable */}
      <div 
        className="flex-1 h-8 flex items-center px-4 text-white text-sm font-medium select-none cursor-move"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span className="mr-2">💬</span>
        CatChat
      </div>
      
      {/* Controles de ventana */}
      <div className="flex" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={minimizeWindow}
          className="w-12 h-8 flex items-center justify-center text-white text-sm hover:bg-white/10 transition-colors"
          title="Minimizar"
        >
          −
        </button>
        <button
          onClick={maximizeWindow}
          className="w-12 h-8 flex items-center justify-center text-white text-sm hover:bg-white/20 transition-colors"
          title="Maximizar/Restaurar"
        >
          □
        </button>
        <button
          onClick={closeWindow}
          className="w-12 h-8 flex items-center justify-center text-white text-sm hover:bg-red-600 transition-colors"
          title="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default WindowControls;
