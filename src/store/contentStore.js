import { create } from 'zustand';
import { apiGet, apiPost } from '../lib/apiClient';

const useContentStore = create((set, get) => ({
  values: {},
  getContent: async (key) => {
    if (get().values[key]) return get().values[key];
    try {
      const value = await apiGet(`/api/content/${key}`);
      set(state => ({ values: { ...state.values, [key]: value } }));
      return value;
    } catch (error) {
      console.error('Error loading content:', error);
      return null;
    }
  },
  updateContent: async (key, value) => {
    try {
      await apiPost(`/api/content/${key}`, { value });
      set(state => ({ values: { ...state.values, [key]: value } }));
      return { success: true };
    } catch (error) {
      console.error('Error updating content:', error);
      return { success: false, error };
    }
  }
}));

export default useContentStore;
