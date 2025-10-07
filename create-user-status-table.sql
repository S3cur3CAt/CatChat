-- Crear tabla para estados de usuarios online/offline
CREATE TABLE IF NOT EXISTS user_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_status_user_id ON user_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_is_online ON user_status(is_online);
CREATE INDEX IF NOT EXISTS idx_user_status_last_seen ON user_status(last_seen);

-- Habilitar Row Level Security
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver todos los estados (necesario para mostrar quién está online)
CREATE POLICY "Users can view all user status" ON user_status
    FOR SELECT USING (true);

-- Política para que los usuarios solo puedan actualizar su propio estado
CREATE POLICY "Users can update own status" ON user_status
    FOR ALL USING (auth.uid()::text = user_id);

-- Habilitar realtime para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE user_status;

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_status_updated_at 
    BEFORE UPDATE ON user_status 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
