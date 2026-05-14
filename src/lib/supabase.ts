import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const cleanSupabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('DEBUG SUPABASE URL:', supabaseUrl);
console.log('DEBUG SUPABASE KEY EXISTS:', !!supabaseAnonKey);
console.log('DEBUG SUPABASE KEY STARTS WITH eyJ:', supabaseAnonKey.startsWith('eyJ'));

// Buat mock client jika credentials belum diisi agar app tidak crash
export let supabase: any;

const isDemo = () => typeof window !== 'undefined' && localStorage.getItem('isDemoMode') === 'true';

const wrapMethods = (instance: any) => {
  const methodsToBlock = ['insert', 'update', 'delete', 'upsert'];
  methodsToBlock.forEach(method => {
     if (typeof instance[method] === 'function') {
       const originalMethod = instance[method].bind(instance);
       instance[method] = (...args: any[]) => {
         if (isDemo()) {
           console.warn('Blocked write operation in demo mode:', method);
           return Promise.resolve({ data: null, error: { message: 'Mode Demo: Data tidak dapat diubah (Read-Only).' } });
         }
         return originalMethod(...args);
       };
     }
  });
  return instance;
};

try {
  const innerClient = cleanSupabaseUrl && supabaseAnonKey 
    ? createClient(cleanSupabaseUrl, supabaseAnonKey)
    : ({
        from: (table: string) => ({
          select: () => {
            const promise = Promise.resolve({ data: [], error: { message: 'Database belum dikonfigurasi.' } });
            (promise as any).order = () => promise;
            (promise as any).limit = () => promise;
            return promise;
          },
          insert: () => {
             if (isDemo()) return Promise.resolve({ data: null, error: { message: 'Mode Demo: Read-Only.' } });
             return Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi.' } });
          },
          update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi.' } }) }),
          delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Database belum dikonfigurasi.' } }) }),
        })
      } as any);

  supabase = {
    ...innerClient,
    from: (table: string) => wrapMethods(innerClient.from(table))
  };
} catch (error) {
  console.error("Gagal menginisialisasi Supabase:", error);
  // Fallback ke mock jika createClient gagal (misal karena pakai secret key)
  const mockClient = {
    from: (table: string) => ({
      select: () => {
        const promise = Promise.resolve({ data: [], error: { message: 'Salah Key: Harap gunakan Anon Public Key, bukan Secret Key.' } });
        (promise as any).order = () => promise;
        (promise as any).limit = () => promise;
        return promise;
      },
      insert: () => {
         if (isDemo()) return Promise.resolve({ data: null, error: { message: 'Mode Demo: Read-Only.' } });
         return Promise.resolve({ data: null, error: { message: 'Salah Key' } });
      },
      update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Salah Key' } }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Salah Key' } }) }),
    })
  };
  supabase = {
    ...mockClient,
    from: (table: string) => wrapMethods(mockClient.from(table))
  };
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Anon Key belum dikonfigurasi. Silakan atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Secrets Environment Anda.');
}
