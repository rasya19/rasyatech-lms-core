import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const cleanSupabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const dummyClient = {
  from: () => ({
    select: () => ({ eq: () => ({ order: () => ({ data: [], error: 'Supabase Not Configured' }), single: () => ({ data: null, error: 'Supabase Not Configured' }) }) }),
    insert: () => Promise.resolve({ data: null, error: 'Supabase Not Configured' }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: 'Supabase Not Configured' }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: 'Supabase Not Configured' }) }),
  }),
  auth: {
    signUp: async () => ({ error: 'Supabase Not Configured' }),
    signInWithPassword: async () => ({ error: 'Supabase Not Configured' }),
    signOut: async () => ({ error: 'Supabase Not Configured' })
  }
} as any;

let client;
try {
  if (cleanSupabaseUrl && supabaseAnonKey && cleanSupabaseUrl.startsWith('http')) {
     client = createClient(cleanSupabaseUrl, supabaseAnonKey);
  } else {
     client = dummyClient;
  }
} catch (e) {
  client = dummyClient;
}

export const supabase = client;
