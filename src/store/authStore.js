import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,
  
  initialize: async () => {
    try {
      console.log('Initializing auth store...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      console.log('Auth initialization successful');
      set({ 
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error in auth initialization:', error);
      set({ 
        error: 'שגיאה בטעינת המשתמש',
        loading: false,
        user: null
      });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      set({ user: data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error in signIn:', error);
      set({ 
        error: 'פרטי התחברות שגויים',
        loading: false 
      });
      return { success: false, error };
    }
  },

  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id }]);

        if (profileError) throw profileError;
      }

      set({ user: data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error in signUp:', error);
      set({ 
        error: 'שגיאה בהרשמה',
        loading: false 
      });
      return { success: false, error };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Error in signOut:', error);
      set({ error: 'שגיאה בהתנתקות' });
    }
  }
}));

export default useAuthStore;