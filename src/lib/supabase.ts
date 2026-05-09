import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const cleanSupabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Buat mock client jika credentials belum diisi agar app tidak crash
export let supabase: any;

try {
  supabase = cleanSupabaseUrl && supabaseAnonKey 
    ? createClient(cleanSupabaseUrl, supabaseAnonKey)
    : ({
        from: () => ({
          select: () => {
            const promise = Promise.resolve({ data: [], error: { message: 'Database belum dikonfigurasi. Jika di Vercel, pastikan Environment Variables VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah disetting.' } });
            (promise as any).order = () => promise;
            (promise as any).limit = () => promise;
            return promise;
          },
          insert: () => {
            const promise = Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi. Jika di Vercel, pastikan Environment Variables VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah disetting.' } });
            (promise as any).select = () => promise;
            return promise;
          },
          update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi. Cek Vercel Env Vars.' } }) }),
          delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi. Cek Vercel Env Vars.' } }) }),
        })
      } as any);
} catch (error) {
  console.error("Gagal menginisialisasi Supabase:", error);
  // Fallback ke mock jika createClient gagal (misal karena pakai secret key)
  supabase = {
    from: () => ({
      select: () => {
        const promise = Promise.resolve({ data: [], error: { message: 'Salah Key: Harap gunakan Anon Public Key, bukan Secret Key.' } });
        (promise as any).order = () => promise;
        (promise as any).limit = () => promise;
        return promise;
      },
      insert: () => {
        const promise = Promise.resolve({ data: null, error: { message: 'Salah Key: Harap gunakan Anon Public Key, bukan Secret Key.' } });
        (promise as any).select = () => promise;
        return promise;
      },
      update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Salah Key' } }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Salah Key' } }) }),
    })
  };
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Anon Key belum dikonfigurasi. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Secrets Environment Anda.');
}
