-- Esquema simplificado para migración de MongoDB a Supabase
-- Crear tablas que puedan manejar ObjectIds de MongoDB y UUIDs

-- Limpiar tablas existentes
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Crear tabla users con id auto-generado como UUID
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- UUID auto-generado
  username TEXT,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  profile_pic TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla messages con id auto-generado como UUID
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- UUID auto-generado
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Función para actualizar el updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario de prueba para testing (cambia esto por tus datos reales)
-- Descomenta y modifica estas líneas:
-- INSERT INTO users (id, username, email, full_name, password) VALUES
-- ('68d754222e5800afa6c305eb', 'testuser', 'test@example.com', 'Test User', '$2a$10$example.hashed.password.here');
