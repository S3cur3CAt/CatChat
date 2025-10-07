import supabase from '../lib/supabase.js';

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE,
          email TEXT UNIQUE,
          full_name TEXT,
          profile_pic TEXT,
          password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.log('Users table error (might already exist):', usersError.message);
    }

    // Create messages table
    console.log('Creating messages table...');
    const { error: messagesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          receiver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          text TEXT,
          image TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (messagesError) {
      console.log('Messages table error (might already exist):', messagesError.message);
    }

    // Create indexes
    console.log('Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `
    });

    if (indexError) {
      console.log('Index creation error:', indexError.message);
    }

    // Create triggers
    console.log('Creating triggers...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
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

    if (triggerError) {
      console.log('Trigger creation error:', triggerError.message);
    }

    // Insert test user
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
    } else {
      console.log('Test user created successfully!');
    }

    console.log('Database setup completed!');

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupDatabase();
