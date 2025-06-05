import React, { useEffect, useState } from "react";
import useCategoriesStore from '../store/categoriesStore';
import useBooksStore from '../store/booksStore';
import { ChevronLeft, Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

function buildCategoryTree(categories) {
  const map = {};
  const roots = [];

  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });

  categories.forEach(cat => {
    if (cat.parent_id) {
      map[cat.parent_id]?.children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });

  return roots;
}

function CategoryBooks({ books, categoryName, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#112a55]">ספרים בקטגוריית {categoryName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.length > 0 ? (
            books.map(book => (
              <Link 
                to={`/books/${book.id}`}
                key={book.id} 
                className="bg-[#f8f6f1] rounded-xl p-4 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-4">
                  <img
                    src={book.image_url || `https://via.placeholder.com/100x150.png?text=${encodeURIComponent(book.title)}`}
                    alt={book.title}
                    className="w-24 h-32 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-bold text-[#112a55]">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-[#a48327] font-bold mt-1">{book.price} ₪</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">אין ספרים בקטגוריה זו</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryTree({ categories, books, onViewBooks }) {
  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#112a55]">{cat.name}</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onViewBooks(cat.name)}
                className="flex items-center gap-2 text-[#a48327] hover:text-[#8b6f1f] transition-colors"
                title="צפה בכל הספרים"
              >
                <BookOpen size={20} />
                <span>כל הספרים</span>
              </button>
              {cat.children.length > 0 && (
                <ChevronLeft className="text-[#a48327]" size={20} />
              )}
            </div>
          </div>
          
          {cat.children.length > 0 && (
            <div className="mt-4 pr-6 space-y-3">
              {cat.children.map(child => (
                <div key={child.id} className="bg-[#f8f6f1] rounded-lg p-4 hover:bg-[#f0ece3] transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[#666]">{child.name}</span>
                    <button
                      onClick={() => onViewBooks(child.name)}
                      className="flex items-center gap-2 text-[#a48327] hover:text-[#8b6f1f] transition-colors"
                      title="צפה בכל הספרים"
                    >
                      <BookOpen size={18} />
                      <span className="text-sm">כל הספרים</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CategoriesView() {
  const { categories, loading: categoriesLoading, error: categoriesError, initialize: initCategories } = useCategoriesStore();
  const { books, loading: booksLoading, error: booksError, initialize: initBooks } = useBooksStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categoryTree = buildCategoryTree(categories);

  useEffect(() => {
    initCategories();
    initBooks();
  }, [initCategories, initBooks]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks([]);
    }
  }, [searchQuery, books]);

  const handleViewBooks = (categoryName) => {
    const categoryBooks = books.filter(book => 
      book.category?.toLowerCase() === categoryName.toLowerCase()
    );
    setSelectedCategory({ name: categoryName, books: categoryBooks });
  };

  const loading = categoriesLoading || booksLoading;
  const error = categoriesError || booksError;

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (categories.length === 0) return <div className="text-center py-8">אין קטגוריות זמינות</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#112a55] mb-2">קטגוריות ספרים</h2>
        <p className="text-gray-600">מצא את הספר המושלם לפי קטגוריה</p>
      </div>

      <div className="relative mb-8">
        <input
          type="text"
          placeholder="חפש ספר או קטגוריה..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-[#a48327] focus:ring-1 focus:ring-[#a48327] outline-none"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {searchQuery ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <Link 
              to={`/books/${book.id}`}
              key={book.id} 
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex gap-4">
                <img
                  src={book.image_url || `https://via.placeholder.com/100x150.png?text=${encodeURIComponent(book.title)}`}
                  alt={book.title}
                  className="w-24 h-32 object-cover rounded"
                />
                <div>
                  <h3 className="font-bold text-[#112a55]">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  <p className="text-[#a48327] font-bold mt-2">{book.price} ₪</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <CategoryTree 
          categories={categoryTree} 
          books={books}
          onViewBooks={handleViewBooks}
        />
      )}

      {selectedCategory && (
        <CategoryBooks
          books={selectedCategory.books}
          categoryName={selectedCategory.name}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}