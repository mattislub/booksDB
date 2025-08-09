import { create } from 'zustand';
import { apiGet, apiPost } from '../lib/apiClient';

const useBooksStore = create((set) => {
  const fetchBooks = async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const query = new URLSearchParams(params).toString();
      const books = await apiGet(`/api/books${query ? `?${query}` : ''}`);
      set({ books, loading: false });
    } catch (error) {
      console.error('Error loading books:', error);
      set({ error: error.message, loading: false });
    }
  };

  return {
    books: [],
    loading: true,
    error: null,

    initialize: () => fetchBooks(),
    searchBooks: (query) => fetchBooks({ search: query }),
    filterBooks: (filters) => fetchBooks(filters),

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
  };
});

export default useBooksStore;
