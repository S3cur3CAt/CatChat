-- =====================================================
-- MIGRACIÓN COMPLETA A SUPABASE PARA CATCHAT
-- =====================================================
-- Este script crea todas las tablas, políticas RLS y funciones necesarias
-- para que CatChat funcione completamente con Supabase

-- =====================================================
-- 1. TABLA DE PERFILES (profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profile_pic TEXT,
  profile_background TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver todos los perfiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Política: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Política: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. TABLA DE CONVERSACIONES (conversations)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver conversaciones donde son miembros
CREATE POLICY "Users can view their conversations" 
  ON public.conversations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = id AND member_id = auth.uid()
    )
  );

-- Política: Los usuarios pueden crear conversaciones
CREATE POLICY "Users can create conversations" 
  ON public.conversations FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- 3. TABLA DE MIEMBROS DE CONVERSACIÓN (conversation_members)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, member_id)
);

-- Índices para conversation_members
CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation ON public.conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_member ON public.conversation_members(member_id);

-- RLS para conversation_members
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver miembros de sus conversaciones
CREATE POLICY "Users can view conversation members" 
  ON public.conversation_members FOR SELECT 
  USING (
    member_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.conversation_members cm 
      WHERE cm.conversation_id = conversation_id AND cm.member_id = auth.uid()
    )
  );

-- Política: Los usuarios pueden agregar miembros a conversaciones donde participan
CREATE POLICY "Users can add members to their conversations" 
  ON public.conversation_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = conversation_members.conversation_id AND member_id = auth.uid()
    ) OR member_id = auth.uid()
  );

-- =====================================================
-- 4. TABLA DE MENSAJES (messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT message_has_content CHECK (text IS NOT NULL OR image_url IS NOT NULL)
);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- RLS para messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver mensajes de sus conversaciones
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = messages.conversation_id AND member_id = auth.uid()
    )
  );

-- Política: Los usuarios pueden enviar mensajes a sus conversaciones
CREATE POLICY "Users can send messages to their conversations" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = messages.conversation_id AND member_id = auth.uid()
    )
  );

-- Política: Los usuarios pueden eliminar sus propios mensajes
CREATE POLICY "Users can delete own messages" 
  ON public.messages FOR DELETE 
  USING (sender_id = auth.uid());

-- =====================================================
-- 5. TABLA DE ESTADO DE USUARIOS (user_status)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_status (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para user_status
CREATE INDEX IF NOT EXISTS idx_user_status_online ON public.user_status(is_online);

-- RLS para user_status
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver el estado de usuarios
CREATE POLICY "User status is viewable by everyone" 
  ON public.user_status FOR SELECT 
  USING (true);

-- Política: Los usuarios solo pueden actualizar su propio estado
CREATE POLICY "Users can update own status" 
  ON public.user_status FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar su propio estado
CREATE POLICY "Users can insert own status" 
  ON public.user_status FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. TABLA DE EVENTOS DE TYPING (typing_events)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.typing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Índices para typing_events
CREATE INDEX IF NOT EXISTS idx_typing_events_receiver ON public.typing_events(receiver_id);
CREATE INDEX IF NOT EXISTS idx_typing_events_expires ON public.typing_events(expires_at);

-- RLS para typing_events
ALTER TABLE public.typing_events ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver eventos de typing dirigidos a ellos
CREATE POLICY "Users can view typing events for them" 
  ON public.typing_events FOR SELECT 
  USING (receiver_id = auth.uid() OR sender_id = auth.uid());

-- Política: Los usuarios pueden crear eventos de typing
CREATE POLICY "Users can create typing events" 
  ON public.typing_events FOR INSERT 
  WITH CHECK (sender_id = auth.uid());

-- Política: Los usuarios pueden eliminar sus propios eventos de typing
CREATE POLICY "Users can delete own typing events" 
  ON public.typing_events FOR DELETE 
  USING (sender_id = auth.uid());

-- =====================================================
-- 7. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_status_updated_at ON public.user_status;
CREATE TRIGGER update_user_status_updated_at
  BEFORE UPDATE ON public.user_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar eventos de typing expirados
CREATE OR REPLACE FUNCTION cleanup_expired_typing_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_events WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. CONFIGURACIÓN DE REALTIME
-- =====================================================

-- Habilitar Realtime para las tablas necesarias
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- =====================================================
-- 9. STORAGE BUCKETS (ejecutar desde el dashboard de Supabase)
-- =====================================================

-- Crear bucket para mensajes (imágenes)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('messages', 'messages', true);

-- Política de storage para mensajes
-- CREATE POLICY "Users can upload message images" 
--   ON storage.objects FOR INSERT 
--   WITH CHECK (bucket_id = 'messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view message images" 
--   ON storage.objects FOR SELECT 
--   USING (bucket_id = 'messages');

-- =====================================================
-- 10. DATOS INICIALES (OPCIONAL)
-- =====================================================

-- Crear función para auto-crear perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-crear perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

-- Verificar que todo se creó correctamente
SELECT 
  'Tablas creadas:' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'conversations', 'conversation_members', 'messages', 'user_status', 'typing_events');
