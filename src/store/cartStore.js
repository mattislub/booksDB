import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  initialize: () => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        set({ items: JSON.parse(storedCart) });
      }
    } catch (error) {
      console.error('שגיאה בטעינת סל הקניות:', error);
    }
  },

  addItem: (book) => {
    set((state) => {
      const existingItem = state.items.find(item => item.id === book.id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...book, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems, isOpen: true };
    });
  },

  removeItem: (bookId) => {
    set((state) => {
      const newItems = state.items.filter(item => item.id !== bookId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (bookId, quantity) => {
    set((state) => {
      const newItems = state.items.map(item =>
        item.id === bookId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0);

      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  closeCart: () => set({ isOpen: false }),
  openCart: () => set({ isOpen: true }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getItemsCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}));

export default useCartStore;