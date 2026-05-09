import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env eksik: VITE_SUPABASE_URL ve/veya VITE_SUPABASE_ANON_KEY tanımlı değil.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
