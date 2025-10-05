import { useState, useEffect, useCallback } from "react";
import { Monitor, Square, Chrome, X, RefreshCw } from "lucide-react";
import { useVideoCallStore } from "../store/useVideoCallStore";

const ScreenShareSelector = ({ isOpen, onClose }) => {
  const { startScreenShare, getAvailableScreens, availableScreens } = useVideoCallStore();
  const [isStarting, setIsStarting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadAvailableScreens = useCallback(async () => {
    setIsLoading(true);
    try {
      await getAvailableScreens();
    } catch (error) {
      console.error('Error cargando fuentes de pantalla:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAvailableScreens]);

  // Cargar fuentes disponibles cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadAvailableScreens();
    }
  }, [isOpen, loadAvailableScreens]);

  // Opciones por defecto para navegadores web
  const defaultShareOptions = [
    {
      id: 'screen',
      name: 'Pantalla completa',
      description: 'Comparte toda tu pantalla',
      icon: Monitor,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'window',
      name: 'Ventana de aplicación',
      description: 'Comparte una ventana específica',
      icon: Square,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'tab',
      name: 'Pestaña del navegador',
      description: 'Comparte una pestaña del navegador',
      icon: Chrome,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleShareOption = async (sourceId) => {
    setIsStarting(true);
    
    try {
      console.log('Iniciando compartir pantalla con fuente:', sourceId);
      await startScreenShare(sourceId);
      onClose();
    } catch (error) {
      console.error('Error iniciando compartir pantalla:', error);
    } finally {
      setIsStarting(false);
    }
  };

  // Determinar qué opciones mostrar
  const optionsToShow = window.electronAPI && availableScreens.length > 0 
    ? availableScreens 
    : defaultShareOptions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Compartir pantalla</h2>
          <div className="flex items-center gap-2">
            {window.electronAPI && (
              <button
                onClick={loadAvailableScreens}
                disabled={isLoading || isStarting}
                className="p-1 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                title="Actualizar lista"
              >
                <RefreshCw size={16} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              disabled={isStarting}
              className="p-1 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-300 text-sm mb-4">
            Selecciona qué quieres compartir con los participantes de la llamada:
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
              <span className="ml-3 text-gray-300">Cargando fuentes disponibles...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {optionsToShow.map((option) => {
                // Para fuentes de Electron, usar iconos dinámicos
                const getIcon = (option) => {
                  if (option.type === 'screen') return Monitor;
                  if (option.type === 'window') return Square;
                  return option.icon || Square;
                };
                
                const IconComponent = getIcon(option);
                const color = option.color || 'from-gray-500 to-gray-600';
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleShareOption(option.id)}
                    disabled={isStarting}
                    className="w-full p-4 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail for Electron sources or icon for web */}
                      {option.thumbnail ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img 
                            src={option.thumbnail} 
                            alt={option.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:scale-105 transition-transform flex-shrink-0`}>
                          <IconComponent size={24} className="text-white" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                          {option.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 truncate">
                          {option.description || (option.type === 'screen' ? 'Pantalla completa' : 'Ventana de aplicación')}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="text-gray-400 group-hover:text-white transition-colors flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading state */}
          {isStarting && (
            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                <p className="text-sm text-blue-300">
                  Iniciando compartir pantalla...
                </p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-xs text-gray-300">
                <p className="mb-1">
                  <strong>Consejo:</strong> Tu navegador te mostrará las opciones disponibles para compartir.
                </p>
                <p>
                  Puedes detener el compartir pantalla en cualquier momento desde los controles de la videollamada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            disabled={isStarting}
            className="w-full py-2 px-4 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-white rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 border border-white rounded-full animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default ScreenShareSelector;
