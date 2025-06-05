import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

export const handleSupabaseError = (error) => {
  console.error('Supabase error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
  
  if (error.code === 'PGRST301') {
    return new Error('לא נמצאו תוצאות');
  }
  
  if (error.code?.startsWith('AUTH')) {
    return new Error('שגיאת אימות. אנא התחבר מחדש.');
  }
  
  return new Error('שגיאה בשרת. אנא נסה שוב מאוחר יותר.');
};

export default supabase;