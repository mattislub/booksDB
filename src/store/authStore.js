import { create } from 'zustand';
import { apiGet, apiPost } from '../lib/apiClient';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,
  
  initialize: async () => {
    try {
      console.log('Initializing auth store...');

      const user = await apiGet('/api/auth/user');

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

      const data = await apiPost('/api/auth/login', { email, password });

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

      const data = await apiPost('/api/auth/register', { email, password });

      if (data?.user) {
        await apiPost('/api/profile', { id: data.user.id });
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
      await apiPost('/api/auth/logout', {});
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Error in signOut:', error);
      set({ error: 'שגיאה בהתנתקות' });
    }
  }
}));

export default useAuthStore;