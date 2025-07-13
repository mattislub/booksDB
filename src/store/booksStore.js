import { create } from 'zustand';
import { apiGet, apiPost } from '../lib/apiClient';

const useBooksStore = create((set) => ({
  books: [],
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const books = await apiGet('/api/books');
      set({ books, loading: false });
    } catch (error) {
      console.error('Error loading books:', error);
      set({ error: error.message, loading: false });
    }
  },

  searchBooks: async (query) => {
    try {
      set({ loading: true, error: null });
      const books = await apiGet(`/api/books?search=${encodeURIComponent(query)}`);
      set({ books, loading: false });
    } catch (error) {
      console.error('Error searching books:', error);
      set({ error: error.message, loading: false });
    }
  },

  getNewArrivals: async () => {
    try {
      return await apiGet('/api/books?filter=newArrivals');
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  },

  getNewInMarket: async () => {
    try {
      return await apiGet('/api/books?filter=newInMarket');
    } catch (error) {
      console.error('Error fetching new in market:', error);
      throw error;
    }
  },

  addBook: async (book) => {
    try {
      const data = await apiPost('/api/books', book);
      set(state => ({ books: [data, ...state.books] }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding book:', error);
      return { success: false, error };
    }
  },

  updateBook: async (id, updatedBook) => {
    try {
      const data = await apiPost(`/api/books/${id}`, updatedBook);
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
      await apiPost(`/api/books/${id}/delete`, {});
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