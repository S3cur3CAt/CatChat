-- Migrar tablas existentes a UUIDs auto-generados
-- Ejecutar esto en Supabase SQL Editor

-- Paso 1: Crear nuevas tablas con UUIDs
CREATE TABLE users_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  profile_pic TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID,
  receiver_id UUID,
  text TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 2: Migrar datos existentes (convertir ObjectIds a UUIDs)
INSERT INTO users_new (id, username, email, full_name, profile_pic, password, created_at, updated_at)
SELECT
  gen_random_uuid() as id,
  username,
  email,
  full_name,
  profile_pic,
  password,
  created_at,
  updated_at
FROM users;

-- Paso 3: Recrear índices
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver_new ON messages_new(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at_new ON messages_new(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email_new ON users_new(email);
CREATE INDEX IF NOT EXISTS idx_users_username_new ON users_new(username);

-- Paso 4: Crear triggers para las nuevas tablas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at_new BEFORE UPDATE ON users_new
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at_new BEFORE UPDATE ON messages_new
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Paso 5: Reemplazar tablas antiguas
DROP TABLE users CASCADE;
DROP TABLE messages CASCADE;

ALTER TABLE users_new RENAME TO users;
ALTER TABLE messages_new RENAME TO messages;

-- Paso 6: Recrear foreign keys
ALTER TABLE messages ADD CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id);
ALTER TABLE messages ADD CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES users(id);

-- Paso 7: Recrear índices con nombres correctos
DROP INDEX IF EXISTS idx_messages_sender_receiver_new;
DROP INDEX IF EXISTS idx_messages_created_at_new;
DROP INDEX IF EXISTS idx_users_email_new;
DROP INDEX IF EXISTS idx_users_username_new;

CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
