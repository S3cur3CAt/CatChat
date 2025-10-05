-- Crear tabla para eventos de typing en tiempo real
CREATE TABLE IF NOT EXISTS typing_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 seconds')
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_typing_events_receiver_id ON typing_events(receiver_id);
CREATE INDEX IF NOT EXISTS idx_typing_events_sender_id ON typing_events(sender_id);
CREATE INDEX IF NOT EXISTS idx_typing_events_expires_at ON typing_events(expires_at);

-- Habilitar Row Level Security
ALTER TABLE typing_events ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver eventos dirigidos a ellos
CREATE POLICY "Users can view typing events for them" ON typing_events
    FOR SELECT USING (auth.uid()::text = receiver_id OR auth.uid()::text = sender_id);

-- Política para que los usuarios puedan crear eventos de typing
CREATE POLICY "Users can create typing events" ON typing_events
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id);

-- Política para que los usuarios puedan actualizar sus propios eventos
CREATE POLICY "Users can update own typing events" ON typing_events
    FOR UPDATE USING (auth.uid()::text = sender_id);

-- Política para que los usuarios puedan eliminar sus propios eventos
CREATE POLICY "Users can delete own typing events" ON typing_events
    FOR DELETE USING (auth.uid()::text = sender_id);

-- Habilitar realtime para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE typing_events;

-- Función para limpiar eventos de typing expirados
CREATE OR REPLACE FUNCTION cleanup_expired_typing_events()
RETURNS void AS $$
BEGIN
    DELETE FROM typing_events WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Crear un trigger que se ejecute cada minuto para limpiar eventos expirados
-- Nota: En producción, esto debería ser un cron job
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('cleanup-typing-events', '* * * * *', 'SELECT cleanup_expired_typing_events();');
