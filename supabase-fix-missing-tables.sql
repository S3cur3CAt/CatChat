-- Crear tablas faltantes

-- 1. Tabla de perfiles (FALTA)
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 2. Tabla de conversaciones (FALTA)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" 
  ON public.conversations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = id AND member_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations" 
  ON public.conversations FOR INSERT WITH CHECK (true);

-- 3. Tabla de miembros de conversación (FALTA - LA MÁS IMPORTANTE)
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation ON public.conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_member ON public.conversation_members(member_id);

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

-- 4. Función para auto-crear perfil cuando se registra un usuario
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Habilitar Realtime para profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Verificar que ahora tienes todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'conversations', 'conversation_members', 'messages', 'user_status')
ORDER BY table_name;
