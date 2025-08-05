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
      const message = error?.status === 401
        ? 'פרטי התחברות שגויים'
        : error?.message || 'שגיאה בהתחברות';
      set({
        error: message,
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
      const message = error?.message || 'שגיאה בהרשמה';
      set({
        error: message,
        loading: false
      });
      return { success: false, error };
    }
  },

  requestPasswordReset: async (email) => {
    try {
      set({ loading: true, error: null });
      await apiPost('/api/auth/request-password-reset', { email });
      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error in requestPasswordReset:', error);
      const message = error?.message || 'שגיאה בשליחת קישור';
      set({ error: message, loading: false });
      return { success: false, error };
    }
  },

  resetPassword: async (token, password) => {
    try {
      set({ loading: true, error: null });
      await apiPost('/api/auth/reset-password', { token, password });
      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      const message = error?.message || 'שגיאה באיפוס הסיסמה';
      set({ error: message, loading: false });
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
