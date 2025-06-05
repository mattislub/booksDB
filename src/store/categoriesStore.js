import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useCategoriesStore = create((set) => ({
  categories: [],
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ categories: data || [], loading: false });
    } catch (error) {
      console.error('Error loading categories:', error);
      set({ error: 'שגיאה בטעינת הקטגוריות', loading: false });
    }
  },

  addCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('categories')
        .update(updatedCategory)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

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
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

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