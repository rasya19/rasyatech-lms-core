import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Buat mock client jika credentials belum diisi agar app tidak crash
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      from: () => ({
        select: () => Promise.resolve({ data: [], error: { message: 'Database belum dikonfigurasi' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi' } }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi' } }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi' } }) }),
      })
    } as any);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Anon Key belum dikonfigurasi. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Secrets Environment Anda.');
}
