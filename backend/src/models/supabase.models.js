import supabase from '../lib/supabase.js';

export class UserModel {
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 es "not found"
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async create(userData) {
    // Usar ID proporcionado o generar uno nuevo
    const { randomUUID } = await import('crypto');
    const userId = userData.id || randomUUID();

    // Crear objeto de inserción con campos explícitos
    const insertData = {
      id: userId, // Usar ID proporcionado o generado
      email: userData.email,
    };

    // Agregar campos opcionales solo si existen
    if (userData.fullName) insertData.full_name = userData.fullName;
    if (userData.profilePic) insertData.profile_pic = userData.profilePic;
    if (userData.password) insertData.password = userData.password;

    console.log('Creating user with data:', insertData);

    const { data, error } = await supabase
      .from('users')
      .insert([insertData])
      .select()
      .single();

    console.log('User creation result:', { data, error });

    if (error) throw error;
    return data;
  }

  static async update(id, updateData) {
    console.log('UserModel.update called with id:', id, 'data:', Object.keys(updateData));

    try {
      // Primero intentar update
      const { data: updateData_result, error: updateError } = await supabase
        .from('users')
        .update({
          full_name: updateData.fullName || updateData.full_name,
          email: updateData.email,
          password: updateData.password,
          username: updateData.username,
          profile_pic: updateData.profilePic || updateData.profile_pic,
          profile_background: updateData.profileBackground || updateData.profile_background,
        })
        .eq('id', id)
        .select()
        .single();

      if (!updateError) {
        console.log('UserModel.update successful (existing user):', updateData_result);
        return updateData_result;
      }

      console.log('Update failed, attempting insert. Error:', updateError);

      // Si update falla, intentar insert
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: id,
          email: updateData.email,
          full_name: updateData.fullName || updateData.full_name || 'Unknown User',
          profile_pic: updateData.profilePic || updateData.profile_pic,
          profile_background: updateData.profileBackground || updateData.profile_background,
        }])
        .select()
        .single();

      if (insertError) {
        console.log('UserModel.insert error details:', insertError);
        throw insertError;
      }

      console.log('UserModel.insert successful (new user):', insertData);
      return insertData;

    } catch (error) {
      console.log('UserModel.update/insert error details:', error);
      throw error;
    }
  }

  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async findAllExcept(loggedInUserId) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, profile_pic')
      .neq('id', loggedInUserId);

    if (error) throw error;
    // Map id to _id for frontend consistency
    return data.map(user => ({
      _id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      profilePic: user.profile_pic
    }));
  }
}

export class MessageModel {
  static async findBetweenUsers(userId1, userId2, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data.reverse(); // Para mostrar los más antiguos primero
  }

  static async countBetweenUsers(userId1, userId2) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`);

    if (error) throw error;
    return count;
  }

  static async create(messageData) {
    // Generar UUID manualmente
    const { randomUUID } = await import('crypto');
    const messageId = randomUUID();
    
    const insertData = {
      id: messageId,
      sender_id: messageData.senderId,
      receiver_id: messageData.receiverId,
      text: messageData.text,
      image: messageData.image,
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 es "not found"
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteConversation(userId1, userId2) {
    const { data, error } = await supabase
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`);

    if (error) throw error;
    return data;
  }
}

export default { UserModel, MessageModel };
