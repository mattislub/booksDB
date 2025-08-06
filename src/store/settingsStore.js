import { create } from 'zustand';
import { apiGet, apiPost } from '../lib/apiClient';

const useSettingsStore = create((set, get) => ({
  values: {},
  getSetting: async (key) => {
    if (get().values[key] !== undefined) return get().values[key];
    try {
      const value = await apiGet(`/api/settings/${key}`);
      set(state => ({ values: { ...state.values, [key]: value } }));
      return value;
    } catch (error) {
      console.error('Error loading setting:', error);
      return null;
    }
  },
  updateSetting: async (key, value) => {
    try {
      await apiPost(`/api/settings/${key}`, { value });
      set(state => ({ values: { ...state.values, [key]: value } }));
      return { success: true };
    } catch (error) {
      console.error('Error updating setting:', error);
      return { success: false, error };
    }
  }
}));

export default useSettingsStore;
