import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useRealtimeStore } from "../store/useRealtimeStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Settings, Download, CheckCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useProfileBackgroundStore } from "../store/useProfileBackgroundStore";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, refreshOnlineUsers } = useRealtimeStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const { selectedBackground } = useProfileBackgroundStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  
  // Estado para actualizaciones
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('');
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  const getUserId = (user) => user?._id ?? user?.id;
  const selectedUserId = getUserId(selectedUser);
  const onlineUserSet = new Set((onlineUsers ?? []).map((id) => String(id)));
  const isCurrentUserOnline = authUser && onlineUserSet.has(String(getUserId(authUser)));

  useEffect(() => {
    getUsers();
    
    // Actualizar usuarios online al cargar
    if (authUser) {
      refreshOnlineUsers();
    }
  }, [getUsers, authUser, refreshOnlineUsers]);

  // Manejar actualizaciones de Electron
  useEffect(() => {
    if (window.electronAPI) {
      // Evento cuando hay una actualización disponible
      const handleUpdateAvailable = (event, info) => {
        console.log('Actualización disponible:', info);
        setUpdateAvailable(true);
        setUpdateInfo(info);
      };

      // TEMPORAL: Simular actualización disponible para testing
      // Comentar o eliminar esta línea en producción
      setTimeout(() => {
        setUpdateAvailable(true);
        setUpdateInfo({ version: '1.0.3', files: [{ size: 85000000 }] });
      }, 2000);

      // Evento de progreso de descarga
      const handleDownloadProgress = (event, progressInfo) => {
        setDownloadProgress(Math.round(progressInfo.percent));
        
        // Calcular velocidad de descarga
        const speed = progressInfo.bytesPerSecond;
        let speedText = '';
        if (speed > 1024 * 1024) {
          speedText = `${(speed / (1024 * 1024)).toFixed(1)} MB/s`;
        } else if (speed > 1024) {
          speedText = `${(speed / 1024).toFixed(0)} KB/s`;
        } else {
          speedText = `${speed} B/s`;
        }
        setDownloadSpeed(speedText);
      };

      // Evento cuando la descarga se completa
      const handleUpdateDownloaded = () => {
        console.log('Actualización descargada');
        setUpdateDownloaded(true);
        setDownloading(false);
        // Mostrar notificación de que se instalará y reiniciará
        setTimeout(() => {
          if (window.electronAPI && window.electronAPI.restartApp) {
            window.electronAPI.restartApp();
          }
        }, 2000);
      };

      // Suscribirse a los eventos
      window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
      window.electronAPI.onDownloadProgress(handleDownloadProgress);
      window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);

      // Limpiar listeners al desmontar
      return () => {
        if (window.electronAPI && window.electronAPI.removeAllListeners) {
          window.electronAPI.removeAllListeners('update-available');
          window.electronAPI.removeAllListeners('download-progress');
          window.electronAPI.removeAllListeners('update-downloaded');
        }
      };
    }
  }, []);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => {
        const userId = getUserId(user);
        return userId ? onlineUserSet.has(String(userId)) : false;
      })
    : users;

  // Función para iniciar la descarga
  const handleUpdate = () => {
    setDownloading(true);
    if (window.electronAPI && window.electronAPI.downloadUpdate) {
      window.electronAPI.downloadUpdate();
    } else {
      // TEMPORAL: Simular descarga para testing
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setDownloadProgress(100);
          setDownloadSpeed('0 KB/s');
          setTimeout(() => {
            setUpdateDownloaded(true);
            setDownloading(false);
          }, 1000);
        } else {
          setDownloadProgress(Math.round(progress));
          // Simular velocidad variable
          const speed = Math.random() * 5 + 1;
          setDownloadSpeed(`${speed.toFixed(1)} MB/s`);
        }
      }, 500);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({(onlineUsers?.length || 0)} online)</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full py-3 pb-0">
        {filteredUsers.map((user) => (
          <button
            key={getUserId(user)}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUserId === getUserId(user) ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {(() => {
                const userId = getUserId(user);
                return userId && onlineUserSet.has(String(userId));
              })() && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>

      {/* Update Banner */}
      <AnimatePresence>
        {updateAvailable && window.electronAPI && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: downloading ? 'auto' : '60px', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="mx-4 mt-2">
              <div
                className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  updateDownloaded 
                    ? 'border-success bg-success/10' 
                    : 'border-primary bg-primary/10'
                }`}
              >
                {/* Contenido del banner */}
                <div className="p-3">
                  {!downloading && !updateDownloaded ? (
                    // Estado inicial - Actualización disponible
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Update Available</p>
                          <p className="text-xs opacity-70">
                            {updateInfo?.version || 'New version'} ready
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleUpdate}
                        className="btn btn-primary btn-sm rounded-lg"
                      >
                        Update
                      </button>
                    </div>
                  ) : updateDownloaded ? (
                    // Estado completado - Listo para reiniciar
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <div>
                          <p className="text-sm font-medium text-success">Update Ready</p>
                          <p className="text-xs opacity-70">Restarting app...</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Estado descargando
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <div>
                            <p className="text-sm font-medium">Downloading Update</p>
                            <p className="text-xs opacity-70">{downloadSpeed}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {downloadProgress}%
                        </span>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${downloadProgress}%` }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full relative"
                        >
                          {/* Efecto de brillo animado */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </motion.div>
                      </div>
                      
                      {/* Información adicional */}
                      <div className="flex items-center justify-between text-xs opacity-70">
                        <span>Version {updateInfo?.version || 'New'}</span>
                        <span>{Math.round((downloadProgress / 100) * (updateInfo?.files?.[0]?.size || 0) / 1024 / 1024) || 0} MB / {Math.round((updateInfo?.files?.[0]?.size || 0) / 1024 / 1024) || 0} MB</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Card */}
      {authUser && (
        <div className="flex-shrink-0 flex justify-center items-center" style={{ height: '82px' }}>
          <div
            className="relative rounded-xl overflow-hidden border-2 border-base-300"
            style={{ width: '302px', height: '66px' }}
          >
            {/* Background based on selection */}
            {selectedBackground === 'none' ? (
              <div className="absolute inset-0 bg-base-200" />
            ) : selectedBackground === 'fireflies' ? (
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-amber-950/10 to-orange-950/20">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + Math.sin(i) * 20}%`,
                    width: '4px',
                    height: '4px',
                    background: `radial-gradient(circle, rgba(255, ${180 + i * 5}, 0, 0.9) 0%, transparent 60%)`,
                    boxShadow: `0 0 12px rgba(255, ${180 + i * 5}, 0, 0.7)`,
                    animationName: 'floatFirefly',
                    animationDuration: `${3 + i * 0.3}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${i * 0.2}s`
                  }}/>
                ))}
              </div>
            ) : selectedBackground === 'matrix' ? (
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-black">
                <div className="absolute top-0 w-1" style={{left: '0%', height: '100%'}}>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '0%', opacity: 1, animation: '2s linear 1s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '25%', opacity: 0.8, animation: '2s linear 1.2s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '50%', opacity: 0.6, animation: '2s linear 1.4s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                </div>
                <div className="absolute top-0 w-1" style={{left: '20%', height: '100%'}}>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '10%', opacity: 1, animation: '2.3s linear 0.5s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '35%', opacity: 0.7, animation: '2.3s linear 0.8s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                </div>
                <div className="absolute top-0 w-1" style={{left: '40%', height: '100%'}}>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '20%', opacity: 1, animation: '1.8s linear 0.2s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '60%', opacity: 0.5, animation: '1.8s linear 0.6s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                </div>
                <div className="absolute top-0 w-1" style={{left: '60%', height: '100%'}}>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '5%', opacity: 1, animation: '2.1s linear 0.8s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '45%', opacity: 0.6, animation: '2.1s linear 1.1s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                </div>
                <div className="absolute top-0 w-1" style={{left: '80%', height: '100%'}}>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '15%', opacity: 1, animation: '1.9s linear 0.3s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                  <div className="absolute w-1 h-2 bg-green-400" style={{top: '55%', opacity: 0.7, animation: '1.9s linear 0.7s infinite normal none running slideDown', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                </div>
              </div>
            ) : selectedBackground === 'nebula' ? (
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-950/20 via-pink-950/20 to-blue-950/20">
                {[...Array(8)].map((_, i) => {
                  const colors = ['purple', 'pink', 'blue', 'cyan'];
                  const color = colors[i % colors.length];
                  const colorMap = {
                    purple: '168, 85, 247',
                    pink: '236, 72, 153',
                    blue: '59, 130, 246',
                    cyan: '34, 211, 238'
                  };
                  return (
                    <div key={i} className="absolute rounded-full" style={{
                      left: `${10 + i * 12}%`,
                      top: `${15 + Math.sin(i * 0.5) * 30}%`,
                      width: `${3 + Math.random() * 3}px`,
                      height: `${3 + Math.random() * 3}px`,
                      background: `radial-gradient(circle, rgba(${colorMap[color]}, 0.8), transparent)`,
                      boxShadow: `0 0 ${10 + Math.random() * 10}px rgba(${colorMap[color]}, 0.6)`,
                      animationName: 'nebulaFloat',
                      animationDuration: `${4 + Math.random() * 2}s`,
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDelay: `${Math.random() * 2}s`,
                      animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
                    }}/>
                  );
                })}
              </div>
            ) : selectedBackground === 'snow' ? (
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-slate-700/30 to-slate-800/40">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute rounded-full bg-white" style={{
                    left: `${15 + (i * 11)}%`,
                    top: '-5px',
                    width: `${2 + Math.random() * 3}px`,
                    height: `${2 + Math.random() * 3}px`,
                    opacity: 0.5 + Math.random() * 0.3,
                    boxShadow: `0 0 ${4 + Math.random() * 4}px rgba(255, 255, 255, 0.6)`,
                    animationName: 'snowFall',
                    animationDuration: `${4 + Math.random() * 3}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDelay: `${Math.random() * 4}s`
                  }}/>
                ))}
              </div>
            ) : selectedBackground === 'ember' ? (
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-t from-red-950/30 to-transparent">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${10 + Math.random() * 80}%`,
                    bottom: '0px',
                    width: `${2 + Math.random() * 2}px`,
                    height: `${3 + Math.random() * 2}px`,
                    background: `radial-gradient(ellipse, rgba(255, ${100 + Math.random() * 55}, 0, 0.9), rgba(255, 0, 0, 0))`,
                    boxShadow: `0 0 ${6 + Math.random() * 4}px rgba(255, ${100 + Math.random() * 55}, 0, 0.7)`,
                    animationName: 'emberRise',
                    animationDuration: `${3 + Math.random() * 2}s`,
                    animationTimingFunction: 'ease-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${Math.random() * 3}s`
                  }}/>
                ))}
              </div>
            ) : selectedBackground === 'galaxy' ? (
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950/20 via-purple-950/20 to-pink-950/20">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${1 + Math.random() * 2}px`,
                    height: `${1 + Math.random() * 2}px`,
                    background: i % 3 === 0 ? 'white' : i % 3 === 1 ? '#a78bfa' : '#ec4899',
                    boxShadow: `0 0 ${3 + Math.random() * 5}px ${i % 3 === 0 ? 'white' : i % 3 === 1 ? '#a78bfa' : '#ec4899'}`,
                    animationName: 'twinkle',
                    animationDuration: `${2 + Math.random() * 3}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${Math.random() * 2}s`
                  }}/>
                ))}
              </div>
            ) : selectedBackground === 'quantum' ? (
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-slate-950/20">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: '2px',
                    height: '2px',
                    background: `rgba(${100 + Math.random() * 155}, ${100 + Math.random() * 155}, 255, 0.8)`,
                    boxShadow: `0 0 ${4 + Math.random() * 6}px rgba(100, 150, 255, 0.6)`,
                    animationName: 'quantumPulse',
                    animationDuration: `${1 + Math.random() * 2}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDelay: `${Math.random() * 1}s`
                  }}/>
                ))}
              </div>
            ) : selectedBackground === 'crystal' ? (
              <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-950/10 via-cyan-950/10 to-teal-950/10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute" style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + Math.sin(i) * 25}%`,
                    width: '0',
                    height: '0',
                    borderLeft: '3px solid transparent',
                    borderRight: '3px solid transparent',
                    borderBottom: `${6 + Math.random() * 4}px solid rgba(34, 211, 238, 0.6)`,
                    filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.8))',
                    animationName: 'crystalRotate',
                    animationDuration: `${3 + i * 0.5}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDelay: `${i * 0.3}s`
                  }}/>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 bg-base-200" />
            )}

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="relative flex-shrink-0">
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt={authUser.fullName}
                    className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg"
                  />
                </div>
                <div className="hidden lg:flex flex-col">
                  <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">
                    {authUser.fullName}
                  </div>
                  <div className={`text-[11px] drop-shadow-lg font-medium whitespace-nowrap ${
                    isCurrentUserOnline ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {isCurrentUserOnline ? 'En línea' : 'Desconectado'}
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => navigate('/settings')}
                className="hidden lg:flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
              >
                <Settings size={15} className="text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
