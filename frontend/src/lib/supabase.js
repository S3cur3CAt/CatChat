import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uyjgerykrvhbzykhzctj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5amdlcnlrcnZoYnp5a2h6Y3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njc3NDksImV4cCI6MjA3NDU0Mzc0OX0.cEPDFrI9Nm7hXz0JaJ_TeAB0CaxfGE9nXAV6_3DoEGE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;
