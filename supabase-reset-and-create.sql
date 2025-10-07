-- RESET COMPLETO Y RECREACIÓN DE TABLAS

-- 1. ELIMINAR TABLAS EXISTENTES (en orden correcto por dependencias)
DROP TABLE IF EXISTS public.typing_events CASCADE;
DROP TABLE IF EXISTS public.user_status CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_members CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. ELIMINAR FUNCIONES Y TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. CREAR TABLA DE PERFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profile_pic TEXT,
  profile_background TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. CREAR TABLA DE CONVERSACIONES (sin políticas aún)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 5. CREAR TABLA DE MIEMBROS DE CONVERSACIÓN
CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, member_id)
);

CREATE INDEX idx_conversation_members_conversation ON public.conversation_members(conversation_id);
CREATE INDEX idx_conversation_members_member ON public.conversation_members(member_id);

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversation members" 
  ON public.conversation_members FOR SELECT 
  USING (
    member_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.conversation_members cm 
      WHERE cm.conversation_id = conversation_id AND cm.member_id = auth.uid()
    )
  );

CREATE POLICY "Users can add members to their conversations" 
  ON public.conversation_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = conversation_members.conversation_id AND member_id = auth.uid()
    ) OR member_id = auth.uid()
  );

-- 6. CREAR TABLA DE MENSAJES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT message_has_content CHECK (text IS NOT NULL OR image_url IS NOT NULL)
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = messages.conversation_id AND member_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = messages.conversation_id AND member_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own messages" 
  ON public.messages FOR DELETE USING (sender_id = auth.uid());

-- 7. CREAR TABLA DE ESTADO DE USUARIOS
CREATE TABLE public.user_status (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_status_online ON public.user_status(is_online);

ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User status is viewable by everyone" 
  ON public.user_status FOR SELECT USING (true);

CREATE POLICY "Users can update own status" 
  ON public.user_status FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own status" 
  ON public.user_status FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. FUNCIÓN PARA AUTO-CREAR PERFIL
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. AGREGAR POLÍTICAS DE CONVERSACIONES (ahora que conversation_members existe)
CREATE POLICY "Users can view their own conversation memberships"
  ON conversation_members FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "Users can create conversations" 
  ON public.conversations FOR INSERT WITH CHECK (true);

-- 10. HABILITAR REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- 11. VERIFICACIÓN FINAL
SELECT 
  'ÉXITO: Todas las tablas creadas' as status,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'conversations', 'conversation_members', 'messages', 'user_status');
