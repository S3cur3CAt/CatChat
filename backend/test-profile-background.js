import supabase from './src/lib/supabase.js';

async function testProfileBackgroundColumn() {
  try {
    console.log('🔍 Testing profile_background column...');

    // Try to select a user with the profile_background column
    const { data, error } = await supabase
      .from('users')
      .select('id, email, profile_background')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing profile_background column:', error);
      return;
    }

    console.log('✅ Column profile_background exists and is accessible!');
    console.log('📊 Sample data:', data);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfileBackgroundColumn();
