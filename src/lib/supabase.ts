import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const cleanSupabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!cleanSupabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL atau Anon Key belum dikonfigurasi. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Secrets Environment Anda.');
}

export const supabase = createClient(cleanSupabaseUrl, supabaseAnonKey);
