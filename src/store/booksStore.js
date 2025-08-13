import { create } from 'zustand';
import { apiGet, apiPost } from '../lib/apiClient';

const useBooksStore = create((set) => {
  const fetchBooks = async (params = {}) => {
    try {
      set({ loading: true, error: null });
      const query = new URLSearchParams(params).toString();
      const data = await apiGet(`/api/books${query ? `?${query}` : ''}`);
      if (Array.isArray(data)) {
        set({ books: data, currentPage: 1, totalPages: 1, loading: false });
      } else {
        set({ books: data.books, currentPage: data.page, totalPages: data.totalPages, loading: false });
      }
    } catch (error) {
      console.error('Error loading books:', error);
      set({ error: error.message, loading: false });
    }
  };

  return {
    books: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 1,

    initialize: (params = {}) => fetchBooks(params),
    searchBooks: (query, params = {}) => fetchBooks({ search: query, ...params }),
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
      const numericId = Number(id);
      const data = await apiPost(`/api/books/${numericId}`, updatedBook);
      set(state => ({
        books: state.books.map(book =>
          Number(book.id) === numericId ? data : book
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
      const numericId = Number(id);
      await apiPost(`/api/books/${numericId}/delete`, {});
      set(state => ({
        books: state.books.filter(book => Number(book.id) !== numericId)
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
