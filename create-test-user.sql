-- Script para crear usuario de prueba
-- Ejecuta esto en el SQL Editor de Supabase

-- Crear usuario de prueba con ObjectId de MongoDB
INSERT INTO users (id, username, email, full_name, password) VALUES
('68d754222e5800afa6c305eb', 'testuser', 'test@example.com', 'Test User', '$2a$10$example.hashed.password.here');

-- También puedes crear un usuario con UUID si prefieres:
-- INSERT INTO users (id, username, email, full_name, password) VALUES
-- (gen_random_uuid(), 'testuser2', 'test2@example.com', 'Test User 2', '$2a$10$example.hashed.password.here');
