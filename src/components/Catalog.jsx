import React, { useEffect, useState } from "react";
import { ShoppingCart, Plus, Eye, Filter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useBooksStore from '../store/booksStore';
import useCartStore from '../store/cartStore';
import useCategoriesStore from '../store/categoriesStore';

export default function Catalog() {
  const { books, loading, error, initialize, filterBooks } = useBooksStore();
  const { categories, initialize: initCategories } = useCategoriesStore();
  const { addItem } = useCartStore();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("search") || "";

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    initCategories();
  }, [initCategories]);

  const applyFilters = () => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategories.length) params.categories = selectedCategories.join(',');
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (Object.keys(params).length) {
      filterBooks(params);
    } else {
      initialize();
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery]);

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#112a55]">קטלוג הספרים</h2>

      <div className="flex flex-col md:flex-row md:gap-6">
        <aside className="mb-6 md:mb-0 md:w-1/4 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#112a55]">
            <Filter size={20} /> סינון מתקדם
          </h3>
          <div className="grid gap-4 md:grid-cols-1 md:items-end">
            <div>
              <span className="font-medium mb-2 block">קטגוריות</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer transition-colors duration-200 ${selectedCategories.includes(cat.id) ? 'bg-[#7c1c2c] text-white border-[#7c1c2c]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <input
                      type="checkbox"
                      value={cat.id}
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="accent-[#7c1c2c]"
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm mb-1">מחיר מינימלי</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#7c1c2c]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">מחיר מקסימלי</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#7c1c2c]"
                />
              </div>
            </div>
            <div className="flex md:justify-end">
              <button
                onClick={applyFilters}
                className="w-full bg-[#7c1c2c] text-white px-6 py-2 rounded-lg hover:bg-[#66121f] transition-colors"
              >
                סנן
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105"
              >
                {book.image_urls?.[0] || book.image_url ? (
                  <img
                    src={book.image_urls?.[0] || book.image_url}
                    alt={book.title}
                    className="w-full h-[250px] object-contain bg-white rounded-t-2xl"
                  />
                ) : (
                  <img
                    src={`https://via.placeholder.com/300x400.png?text=${encodeURIComponent(book.title)}`}
                    alt={book.title}
                    className="w-full h-[250px] object-contain bg-white rounded-t-2xl"
                  />
                )}

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[#112a55] mb-2">{book.title}</h3>
                    {(book.categories?.length || book.category) && (
                      <p className="text-sm text-gray-500 mb-2">
                        קטגוריה: {book.categories?.join(', ') || book.category}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">{book.description}</p>
                    <p className="text-md font-bold text-[#a48327]">{book.price} ₪</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => addItem(book)}
                      className="bg-[#7c1c2c] text-white py-2 px-4 rounded-lg hover:bg-[#66121f] flex items-center gap-2"
                    >
                      <ShoppingCart size={18} /> <span>קנייה מיידית</span>
                    </button>
                    <div className="flex gap-2 text-xl">
                      <button className="text-gray-500 hover:text-green-600" title="הוספה לרשימת משאלות">
                        <Plus size={18} />
                      </button>
                      <Link to={`/books/${book.id}`} className="text-gray-500 hover:text-blue-600" title="צפייה בפרטים">
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
