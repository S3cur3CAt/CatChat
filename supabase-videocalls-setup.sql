-- ============================================
-- CONFIGURACIÓN DE VIDEOLLAMADAS CON SUPABASE
-- ============================================

-- Tabla para manejar las videollamadas activas
CREATE TABLE IF NOT EXISTS video_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    caller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    call_type VARCHAR(10) DEFAULT 'video' CHECK (call_type IN ('video', 'audio')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'connecting', 'connected', 'ended', 'rejected')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para manejar las señales WebRTC
CREATE TABLE IF NOT EXISTS webrtc_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID NOT NULL REFERENCES video_calls(id) ON DELETE CASCADE,
    from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate', 'renegotiation')),
    signal_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_video_calls_caller ON video_calls(caller_id);
CREATE INDEX idx_video_calls_receiver ON video_calls(receiver_id);
CREATE INDEX idx_video_calls_status ON video_calls(status);
CREATE INDEX idx_webrtc_signals_call ON webrtc_signals(call_id);
CREATE INDEX idx_webrtc_signals_to_user ON webrtc_signals(to_user_id, processed);
CREATE INDEX idx_webrtc_signals_created ON webrtc_signals(created_at);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_video_calls_updated_at
    BEFORE UPDATE ON video_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar señales antiguas (más de 1 hora)
CREATE OR REPLACE FUNCTION cleanup_old_webrtc_signals()
RETURNS void AS $$
BEGIN
    DELETE FROM webrtc_signals 
    WHERE created_at < NOW() - INTERVAL '1 hour';
    
    -- También limpiar llamadas que quedaron colgadas
    UPDATE video_calls 
    SET status = 'ended', 
        ended_at = NOW()
    WHERE status IN ('pending', 'connecting') 
    AND created_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Función para obtener llamadas activas de un usuario
CREATE OR REPLACE FUNCTION get_active_calls(user_id TEXT)
RETURNS TABLE (
    call_id UUID,
    caller_id TEXT,
    receiver_id TEXT,
    call_type VARCHAR,
    status VARCHAR,
    started_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id AS call_id,
        video_calls.caller_id,
        video_calls.receiver_id,
        video_calls.call_type,
        video_calls.status,
        video_calls.started_at
    FROM video_calls
    WHERE (video_calls.caller_id = user_id OR video_calls.receiver_id = user_id)
    AND video_calls.status IN ('pending', 'connecting', 'connected')
    ORDER BY video_calls.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE webrtc_signals ENABLE ROW LEVEL SECURITY;

-- Política para video_calls: usuarios solo pueden ver sus propias llamadas
CREATE POLICY "Users can view their own calls" ON video_calls
    FOR SELECT USING (
        auth.uid()::TEXT = caller_id OR 
        auth.uid()::TEXT = receiver_id
    );

-- Política para video_calls: usuarios pueden crear llamadas
CREATE POLICY "Users can create calls" ON video_calls
    FOR INSERT WITH CHECK (
        auth.uid()::TEXT = caller_id
    );

-- Política para video_calls: usuarios pueden actualizar sus propias llamadas
CREATE POLICY "Users can update their own calls" ON video_calls
    FOR UPDATE USING (
        auth.uid()::TEXT = caller_id OR 
        auth.uid()::TEXT = receiver_id
    );

-- Política para webrtc_signals: usuarios pueden ver señales dirigidas a ellos
CREATE POLICY "Users can view their signals" ON webrtc_signals
    FOR SELECT USING (
        auth.uid()::TEXT = from_user_id OR 
        auth.uid()::TEXT = to_user_id
    );

-- Política para webrtc_signals: usuarios pueden crear señales
CREATE POLICY "Users can create signals" ON webrtc_signals
    FOR INSERT WITH CHECK (
        auth.uid()::TEXT = from_user_id
    );

-- Política para webrtc_signals: usuarios pueden actualizar señales dirigidas a ellos
CREATE POLICY "Users can update signals to them" ON webrtc_signals
    FOR UPDATE USING (
        auth.uid()::TEXT = to_user_id
    );

-- Función para iniciar una videollamada
CREATE OR REPLACE FUNCTION start_video_call(
    p_caller_id TEXT,
    p_receiver_id TEXT,
    p_call_type VARCHAR DEFAULT 'video'
)
RETURNS UUID AS $$
DECLARE
    v_call_id UUID;
BEGIN
    -- Verificar si ya existe una llamada activa entre estos usuarios
    SELECT id INTO v_call_id
    FROM video_calls
    WHERE ((caller_id = p_caller_id AND receiver_id = p_receiver_id) 
        OR (caller_id = p_receiver_id AND receiver_id = p_caller_id))
    AND status IN ('pending', 'connecting', 'connected')
    LIMIT 1;
    
    IF v_call_id IS NOT NULL THEN
        -- Retornar la llamada existente
        RETURN v_call_id;
    END IF;
    
    -- Crear nueva llamada
    INSERT INTO video_calls (caller_id, receiver_id, call_type, status)
    VALUES (p_caller_id, p_receiver_id, p_call_type, 'pending')
    RETURNING id INTO v_call_id;
    
    RETURN v_call_id;
END;
$$ LANGUAGE plpgsql;

-- Función para rechazar una llamada
CREATE OR REPLACE FUNCTION reject_video_call(p_call_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE video_calls
    SET status = 'rejected',
        ended_at = NOW()
    WHERE id = p_call_id
    AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para aceptar una llamada
CREATE OR REPLACE FUNCTION accept_video_call(p_call_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE video_calls
    SET status = 'connecting'
    WHERE id = p_call_id
    AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para finalizar una llamada
CREATE OR REPLACE FUNCTION end_video_call(p_call_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE video_calls
    SET status = 'ended',
        ended_at = NOW()
    WHERE id = p_call_id
    AND status IN ('pending', 'connecting', 'connected');
    
    -- Marcar todas las señales como procesadas
    UPDATE webrtc_signals
    SET processed = TRUE
    WHERE call_id = p_call_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION start_video_call(TEXT, TEXT, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_video_call(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_video_call(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION end_video_call(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_calls(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_webrtc_signals() TO authenticated;
