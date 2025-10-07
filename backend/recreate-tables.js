import supabase from './src/lib/supabase.js';

async function recreateTables() {
  try {
    console.log('Starting table recreation...');

    // Drop existing tables
    console.log('Dropping existing tables...');
    await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS messages CASCADE;' });
    await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS users CASCADE;' });

    // Create users table with auto-generated UUIDs
    console.log('Creating users table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          username TEXT,
          email TEXT NOT NULL UNIQUE,
          full_name TEXT,
          profile_pic TEXT,
          password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create messages table
    console.log('Creating messages table...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
          receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
          text TEXT,
          image TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Create indexes
    console.log('Creating indexes...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `
    });

    // Create triggers
    console.log('Creating triggers...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    });

    // Create test user
    console.log('Creating test user...');
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const hashedPassword = await bcrypt.default.hash('password123', salt);

    const { error: userError } = await supabase
      .from('users')
      .insert([{
        email: 'test@example.com',
        password: hashedPassword,
        full_name: 'Test User',
        username: 'testuser'
      }]);

    if (userError) {
      console.error('Error creating test user:', userError);
    } else {
      console.log('Test user created successfully!');
    }

    console.log('Table recreation completed successfully!');

  } catch (error) {
    console.error('Error during table recreation:', error);
  }
}

recreateTables();
