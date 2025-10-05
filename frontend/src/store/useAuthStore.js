import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase.js";
import { useProfileBackgroundStore } from "./useProfileBackgroundStore.js";
import { useRealtimeStore } from "./useRealtimeStore.js";

export const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    isDeletingAccount: false,
    onlineUsers: [], // Sincronizado desde useRealtimeStore
    isRealtimeInitialized: false,

    // Verificar autenticación al cargar
    checkAuth: async () => {
      try {
        console.log('🔍 Verificando sesión de Supabase...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          console.log('✅ Sesión encontrada:', session.user.id);
          
          // Obtener datos completos del usuario desde la tabla profiles
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          // Combinar datos de auth y profile
          const userData = {
            _id: session.user.id,
            id: session.user.id,
            email: session.user.email,
            fullName: profile?.full_name || session.user.user_metadata?.full_name || 'Unknown User',
            profilePic: profile?.profile_pic || session.user.user_metadata?.profile_pic,
            profileBackground: profile?.profile_background,
            createdAt: session.user.created_at
          };
          
          set({ authUser: userData });
          
          if (!get().isRealtimeInitialized) {
            useRealtimeStore.getState().initializeRealtime(session.user.id);
            set({ isRealtimeInitialized: true });
          }
          
          // Cargar preferencias del usuario
          useProfileBackgroundStore.getState().loadFromUser(userData);
        } else {
          console.log('❌ No hay sesión activa');
          set({ authUser: null });
        }
      } catch (error) {
        console.error("❌ Error en checkAuth:", error.message);
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    // Registro de usuario
    signup: async (data) => {
      const { isSigningUp } = get();
      
      if (isSigningUp) {
        console.log("⚠️ Signup ya en progreso, ignorando...");
        return;
      }
      
      set({ isSigningUp: true });
      try {
        console.log('📝 Registrando usuario en Supabase...');
        
        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName
            }
          }
        });
        
        if (authError) throw authError;
        
        if (!authData.user) {
          throw new Error('No se pudo crear el usuario');
        }
        
        console.log('✅ Usuario creado en Auth:', authData.user.id);
        
        // Esperar un momento para que el trigger cree el perfil
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Obtener el perfil creado por el trigger
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (profileError) {
          console.error('⚠️ Error obteniendo perfil:', profileError);
        }
        
        const userData = {
          _id: authData.user.id,
          id: authData.user.id,
          email: authData.user.email,
          fullName: profile?.full_name || data.fullName,
          profilePic: profile?.profile_pic || null,
          createdAt: authData.user.created_at
        };
        
        set({ authUser: userData });
        toast.success("Account created successfully");
        
        // Esperar un poco más para que la sesión se establezca completamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!get().isRealtimeInitialized) {
          useRealtimeStore.getState().initializeRealtime(authData.user.id);
          set({ isRealtimeInitialized: true });
        }
        
        // Cargar preferencias
        useProfileBackgroundStore.getState().loadFromUser(userData);
      } catch (error) {
        console.error('❌ Error en signup:', error);
        toast.error(error.message || "Signup failed");
      } finally {
        set({ isSigningUp: false });
      }
    },

    // Inicio de sesión
    login: async (data) => {
      const { isLoggingIn } = get();
      
      if (isLoggingIn) {
        console.log("⚠️ Login ya en progreso, ignorando...");
        return;
      }
      
      set({ isLoggingIn: true });
      try {
        console.log("🔐 Iniciando login con Supabase...");
        
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });
        
        if (error) throw error;
        
        console.log("✅ Login exitoso:", authData.user.id);
        
        // Obtener perfil completo
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        const userData = {
          _id: authData.user.id,
          id: authData.user.id,
          email: authData.user.email,
          fullName: profile?.full_name || authData.user.user_metadata?.full_name || 'Unknown User',
          profilePic: profile?.profile_pic,
          profileBackground: profile?.profile_background,
          createdAt: authData.user.created_at
        };
        
        set({ authUser: userData });
        toast.success("Logged in successfully");
        
        // Inicializar Realtime
        useRealtimeStore.getState().initializeRealtime(authData.user.id);
        
        // Cargar preferencias
        useProfileBackgroundStore.getState().loadFromUser(userData);
      } catch (error) {
        console.error("❌ Error en login:", error);
        toast.error(error.message || "Login failed");
      } finally {
        set({ isLoggingIn: false });
      }
    },

    // Cerrar sesión
    logout: async () => {
      try {
        console.log('🚪 Cerrando sesión...');
        
        const { authUser } = get();
        
        // Marcar usuario como offline
        if (authUser) {
          try {
            await useRealtimeStore.getState().setUserOffline(authUser.id);
          } catch (error) {
            console.warn('⚠️ No se pudo marcar usuario como offline:', error);
          }
        }
        
        // Limpiar Realtime
        useRealtimeStore.getState().cleanup();
        set({ isRealtimeInitialized: false });
        
        // Intentar cerrar sesión en Supabase
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { error } = await supabase.auth.signOut();
            if (error && error.message !== 'Auth session missing!') {
              console.error('⚠️ Error al cerrar sesión en Supabase:', error);
            }
          }
        } catch (error) {
          console.warn('⚠️ Error al cerrar sesión en Supabase:', error);
        }
        
        // Limpiar estado local independientemente del resultado
        set({ authUser: null, onlineUsers: [] });
        toast.success("Logged out successfully");
        
        // Limpiar localStorage para asegurar logout completo
        localStorage.removeItem('supabase.auth.token');
        
      } catch (error) {
        console.error('❌ Error crítico en logout:', error);
        
        // Forzar limpieza del estado local incluso si hay error
        set({ authUser: null, onlineUsers: [] });
        useRealtimeStore.getState().cleanup();
        set({ isRealtimeInitialized: false });
        
        toast.success("Logged out successfully");
      }
    },

    // Actualizar perfil
    updateProfile: async (data) => {
      try {
        const { authUser } = get();
        
        if (!authUser) throw new Error('No user logged in');
        
        console.log('🔄 Actualizando perfil...');
        
        // Actualizar en la tabla profiles
        const { data: updatedProfile, error } = await supabase
          .from('profiles')
          .update({
            full_name: data.fullName,
            profile_pic: data.profilePic
          })
          .eq('id', authUser.id)
          .select()
          .single();
        
        if (error) throw error;
        
        const updatedUser = {
          ...authUser,
          fullName: updatedProfile.full_name,
          profilePic: updatedProfile.profile_pic
        };
        
        set({ authUser: updatedUser });
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("❌ Error actualizando perfil:", error);
        toast.error(error.message || "Failed to update profile");
      } finally {
        set({ isUpdatingProfile: false });
      }
    },

    // Eliminar cuenta
    deleteAccount: async () => {
      set({ isDeletingAccount: true });
      try {
        const { authUser } = get();
        
        if (!authUser) throw new Error('No user logged in');
        
        console.log('🗑️ Eliminando cuenta...');
        
        // Marcar como offline
        await useRealtimeStore.getState().setUserOffline(authUser.id);
        
        // Limpiar Realtime
        useRealtimeStore.getState().cleanup();
        
        // Eliminar perfil (las políticas RLS deben manejar cascada)
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', authUser.id);
        
        if (profileError) {
          console.error('⚠️ Error eliminando perfil:', profileError);
        }
        
        // Cerrar sesión
        await supabase.auth.signOut();
        
        set({ authUser: null, onlineUsers: [] });
        toast.success("Account deleted successfully");
        window.location.href = "/";
      } catch (error) {
        console.error('❌ Error eliminando cuenta:', error);
        toast.error(error.message || "Failed to delete account");
      } finally {
        set({ isDeletingAccount: false });
      }
    },

    // Sincronizar usuarios online desde Realtime
    syncOnlineUsers: () => {
      const realtimeStore = useRealtimeStore.getState();
      set({ onlineUsers: realtimeStore.onlineUsers });
    }
  }))
);

// Listener para cambios de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth state changed:', event);
  
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ authUser: null, onlineUsers: [] });
    useRealtimeStore.getState().cleanup();
  } else if (event === 'SIGNED_IN' && session?.user) {
    // La sesión se maneja en checkAuth/login/signup
    console.log('✅ Usuario autenticado:', session.user.id);
  }
});
