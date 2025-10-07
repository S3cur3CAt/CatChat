-- Migrar datos de MongoDB a Supabase
-- Primero, vamos a crear las tablas sin restricciones para poder insertar los datos existentes

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

-- Crear tabla users sin restricciones inicialmente
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY, -- Para ObjectIds de MongoDB
  username VARCHAR(255),
  email VARCHAR(255),
  full_name VARCHAR(255),
  profile_pic TEXT,
  password VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla messages sin restricciones inicialmente
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY, -- Para ObjectIds de MongoDB
  sender_id VARCHAR(255),
  receiver_id VARCHAR(255),
  text TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos usuarios de prueba (reemplaza con tus datos reales)
-- INSERT INTO users (id, username, email, full_name, password) VALUES
-- ('68d754222e5800afa6c305eb', 'testuser', 'test@example.com', 'Test User', 'hashedpassword');

-- Una vez que hayas insertado los datos, ejecuta esto para convertir a UUIDs:
-- ALTER TABLE users ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
-- UPDATE users SET new_id = gen_random_uuid() WHERE new_id IS NULL;
-- ALTER TABLE users DROP CONSTRAINT users_pkey;
-- ALTER TABLE users ADD PRIMARY KEY (new_id);
-- ALTER TABLE users RENAME COLUMN id TO old_id;
-- ALTER TABLE users RENAME COLUMN new_id TO id;

-- Para messages:
-- ALTER TABLE messages ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
-- UPDATE messages SET new_id = gen_random_uuid() WHERE new_id IS NULL;
-- ALTER TABLE messages DROP CONSTRAINT messages_pkey;
-- ALTER TABLE messages ADD PRIMARY KEY (new_id);
-- ALTER TABLE messages RENAME COLUMN id TO old_id;
-- ALTER TABLE messages RENAME COLUMN new_id TO id;

-- Actualizar foreign keys después de la conversión
-- ALTER TABLE messages ADD CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id);
-- ALTER TABLE messages ADD CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES users(id);
