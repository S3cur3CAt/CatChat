import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uyjgerykrvhbzykhzctj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5amdlcnlrcnZoYnp5a2h6Y3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njc3NDksImV4cCI6MjA3NDU0Mzc0OX0.cEPDFrI9Nm7hXz0JaJ_TeAB0CaxfGE9nXAV6_3DoEGE';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5amdlcnlrcnZoYnp5a2h6Y3RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk2Nzc0OSwiZXhwIjoyMDc0NTQzNzQ5fQ.MmKMKnMXn30EBARQHwbG3V0wi5nlyOaB6BZyblOHe7g';

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default supabase;
