import { supabase } from './supabase.js';

// Función para actualizar el estado de un usuario a online
export const setUserOnline = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_status')
      .upsert({
        user_id: userId,
        is_online: true,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error setting user online:', error);
      return false;
    }

    console.log(`✅ Usuario ${userId} marcado como online`);
    return true;
  } catch (error) {
    console.error('Error in setUserOnline:', error);
    return false;
  }
};

// Función para actualizar el estado de un usuario a offline
export const setUserOffline = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_status')
      .upsert({
        user_id: userId,
        is_online: false,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error setting user offline:', error);
      return false;
    }

    console.log(`❌ Usuario ${userId} marcado como offline`);
    return true;
  } catch (error) {
    console.error('Error in setUserOffline:', error);
    return false;
  }
};

// Función para obtener todos los usuarios online
export const getOnlineUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('user_status')
      .select('user_id')
      .eq('is_online', true);

    if (error) {
      console.error('Error getting online users:', error);
      return [];
    }

    return data.map(row => row.user_id);
  } catch (error) {
    console.error('Error in getOnlineUsers:', error);
    return [];
  }
};

// Función para limpiar usuarios offline (llamar periódicamente)
export const cleanupOfflineUsers = async () => {
  try {
    // Marcar como offline usuarios que no han sido vistos en los últimos 30 segundos
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('user_status')
      .update({ is_online: false })
      .lt('last_seen', thirtySecondsAgo)
      .eq('is_online', true)
      .select();

    if (error) {
      console.error('Error cleaning up offline users:', error);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`🧹 ${data.length} usuarios marcados como offline por inactividad`);
      data.forEach(user => {
        console.log(`- Usuario ${user.user_id} marcado como offline`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error in cleanupOfflineUsers:', error);
    return false;
  }
};
