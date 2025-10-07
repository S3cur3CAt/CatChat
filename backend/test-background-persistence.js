// Script para probar la funcionalidad de guardar background en Supabase
import supabase from './src/lib/supabase.js';

async function testBackgroundPersistence() {
  try {
    console.log('🧪 Testing background persistence in Supabase...');

    // Obtener un usuario existente
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, profile_background')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const testUser = users[0];
    console.log('👤 Testing with user:', testUser.email);

    // Probar actualizar el background
    const testBackground = 'floating';
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ profile_background: testBackground })
      .eq('id', testUser.id)
      .select('id, email, profile_background')
      .single();

    if (updateError) {
      console.error('❌ Error updating background:', updateError);
      return;
    }

    console.log('✅ Background updated successfully!');
    console.log('📊 Updated user:', updatedUser);

    // Verificar que se guardó correctamente
    const { data: verifiedUser, error: verifyError } = await supabase
      .from('users')
      .select('id, email, profile_background')
      .eq('id', testUser.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    if (verifiedUser.profile_background === testBackground) {
      console.log('🎉 SUCCESS: Background persistence works correctly!');
      console.log('💾 Saved background:', verifiedUser.profile_background);
    } else {
      console.log('❌ FAILURE: Background not saved correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBackgroundPersistence();
