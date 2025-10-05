import Navbar from "./components/Navbar";
import WindowControls from "./components/WindowControls";
import TailscaleStatus from "./components/TailscaleStatus";
import ErrorBoundary from "./components/ErrorBoundary";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useMessageStyles } from "./hooks/useMessageStyles";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  
  // Inicializar estilos de mensajes
  useMessageStyles();

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Inicializando aplicación con Supabase...');
      
      // Solicitar permisos de notificación al inicializar
      console.log('🔔 Requesting notification permissions...');
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      }
      
      // En Electron, mostrar notificación de prueba
      if (window.electronAPI) {
        console.log('📱 Electron detected - testing notifications');
        
        setTimeout(async () => {
          try {
            await window.electronAPI.showNotification(
              'CatChat Ready', 
              'Notifications are working! You will receive alerts for new messages.',
              null
            );
            console.log('✅ Test notification shown successfully');
          } catch (error) {
            console.error('❌ Test notification failed:', error);
          }
        }, 3000);
      }
      
      // Verificar autenticación con Supabase
      console.log('🔐 Verificando autenticación con Supabase...');
      checkAuth();
    };

    initializeApp();
  }, [checkAuth]);

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // console.log({ authUser }); // Removed to prevent flickering

  if (isCheckingAuth && !authUser)
    return (
      <div>
        {/* Controles de ventana para Electron */}
        <WindowControls />
        <div className={`flex flex-col items-center justify-center h-screen ${window.electronAPI ? "pt-8" : ""}`}>
          <Loader className="size-10 animate-spin mb-4" />
          <p className="text-base-content/60">
            Checking authentication with Supabase...
          </p>
        </div>
      </div>
    );

  return (
    <ErrorBoundary>
      <div data-theme={theme}>
        {/* Controles de ventana para Electron */}
        <WindowControls />
        
        {/* Estado de Tailscale */}
        <TailscaleStatus />
        
        {/* Contenido principal con padding para la barra de título */}
        <div className={window.electronAPI ? "pt-8" : ""}>
          {authUser && <Navbar />}

          <Routes>
            <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          </Routes>
        </div>

        <Toaster />
      </div>
    </ErrorBoundary>
  );
};
export default App;
