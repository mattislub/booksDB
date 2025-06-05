import { create } from 'zustand';
import { supabase, handleSupabaseError } from '../lib/supabaseClient';

const useBooksStore = create((set) => ({
  books: [],
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select(`
          *,
          categories:book_categories(
            category:categories(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (booksError) throw handleSupabaseError(booksError);

      // Transform the categories data
      const transformedBooks = books.map(book => ({
        ...book,
        categories: book.categories.map(c => c.category)
      }));

      set({ books: transformedBooks, loading: false });
    } catch (error) {
      console.error('Error loading books:', error);
      set({ error: error.message, loading: false });
    }
  },

  searchBooks: async (query) => {
    try {
      set({ loading: true, error: null });
      
      let supabaseQuery = supabase
        .from('books')
        .select('*');

      if (query) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const { data, error } = await supabaseQuery
        .order('created_at', { ascending: false });

      if (error) throw handleSupabaseError(error);
      set({ books: data || [], loading: false });
    } catch (error) {
      console.error('Error searching books:', error);
      set({ error: error.message, loading: false });
    }
  },

  getNewArrivals: async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_new_arrival', true)
        .order('created_at', { ascending: false });

      if (error) throw handleSupabaseError(error);
      return data || [];
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  },

  getNewInMarket: async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_new_in_market', true)
        .order('created_at', { ascending: false });

      if (error) throw handleSupabaseError(error);
      return data || [];
    } catch (error) {
      console.error('Error fetching new in market:', error);
      throw error;
    }
  },

  addBook: async (book) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([book])
        .select()
        .single();

      if (error) throw handleSupabaseError(error);

      set(state => ({
        books: [data, ...state.books]
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding book:', error);
      return { success: false, error };
    }
  },

  updateBook: async (id, updatedBook) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .update(updatedBook)
        .eq('id', id)
        .select()
        .single();

      if (error) throw handleSupabaseError(error);

      set(state => ({
        books: state.books.map(book => 
          book.id === id ? data : book
        )
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating book:', error);
      return { success: false, error };
    }
  },

  deleteBook: async (id) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw handleSupabaseError(error);

      set(state => ({
        books: state.books.filter(book => book.id !== id)
      }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting book:', error);
      return { success: false, error };
    }
  }
}));

export default useBooksStore;