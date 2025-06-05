import { create } from 'zustand';
import { apiGet, apiPost } from '../lib/apiClient';

const useCategoriesStore = create((set) => ({
  categories: [],
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const data = await apiGet('/api/categories');
      set({ categories: data || [], loading: false });
    } catch (error) {
      console.error('Error loading categories:', error);
      set({ error: 'שגיאה בטעינת הקטגוריות', loading: false });
    }
  },

  addCategory: async (category) => {
    try {
      const data = await apiPost('/api/categories', category);
      set(state => ({
        categories: [...state.categories, data]
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding category:', error);
      return { success: false, error };
    }
  },

  updateCategory: async (id, updatedCategory) => {
    try {
      const data = await apiPost(`/api/categories/${id}`, updatedCategory);
      set(state => ({
        categories: state.categories.map(category =>
          category.id === id ? data : category
        )
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error };
    }
  },

  deleteCategory: async (id) => {
    try {
      await apiPost(`/api/categories/${id}/delete`, {});
      set(state => ({
        categories: state.categories.filter(category => category.id !== id)
      }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error };
    }
  }
}));

export default useCategoriesStore;