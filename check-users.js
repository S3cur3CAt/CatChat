import supabase from './backend/src/lib/supabase.js';

async function checkUsers() {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('=== USUARIOS EN BASE DE DATOS ===');
      data.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Full Name: ${user.full_name}`);
        console.log(`   Profile Pic: ${user.profile_pic ? 'YES' : 'NO'}`);
        console.log('');
      });
    }
  } catch (err) {
    console.log('Error checking users:', err.message);
  }
}

checkUsers();
