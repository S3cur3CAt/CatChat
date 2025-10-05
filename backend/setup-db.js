import supabase from './src/lib/supabase.js';

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (testError && testError.code !== 'PGRST116') {
      console.log('Connection test failed:', testError.message);
      return;
    }

    console.log('Supabase connection successful!');

    // Try to insert a test user
    console.log('Creating test user...');
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash('password123', salt);

    const { error: insertError } = await supabase
      .from('users')
      .upsert([
        {
          id: '68d754222e5800afa6c305eb',
          username: 'testuser',
          email: 'test@example.com',
          full_name: 'Test User',
          password: hashedPassword,
        }
      ]);

    if (insertError) {
      console.log('Error creating test user:', insertError.message);
      console.log('This might mean the table does not exist yet.');
      console.log('Please create the tables manually in Supabase SQL Editor using:');
      console.log('supabase-migration.sql');
    } else {
      console.log('Test user created successfully!');
    }

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();
