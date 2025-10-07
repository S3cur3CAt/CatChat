-- Limpiar todas las conversaciones y mensajes duplicados
-- ADVERTENCIA: Esto eliminará TODOS los mensajes y conversaciones

-- 1. Eliminar todos los mensajes
DELETE FROM messages;

-- 2. Eliminar todos los miembros de conversaciones
DELETE FROM conversation_members;

-- 3. Eliminar todas las conversaciones
DELETE FROM conversations;

-- 4. Verificar que todo está limpio
SELECT 'Messages count:' as table_name, COUNT(*) as count FROM messages
UNION ALL
SELECT 'Conversation members count:', COUNT(*) FROM conversation_members
UNION ALL
SELECT 'Conversations count:', COUNT(*) FROM conversations;
