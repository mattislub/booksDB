import React, { useEffect, useState } from "react";
import { ShoppingCart, Plus, Filter } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useBooksStore from '../store/booksStore';
import useCartStore from '../store/cartStore';
import useCategoriesStore from '../store/categoriesStore';

export default function Catalog() {
  const { books, loading, error, filterBooks, currentPage, totalPages } = useBooksStore();
  const { categories, initialize: initCategories } = useCategoriesStore();
  const { addItem } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";
  const initialCategories = searchParams.get("categories")
    ? searchParams
        .get("categories")
        .split(',')
        .map(id => parseInt(id, 10))
        .filter(Boolean)
    : [];

  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    initCategories();
  }, [initCategories]);

  useEffect(() => {
    const categoryNames = selectedCategories
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean);

    const previousTitle = document.title;
    const descriptionTag =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const tag = document.createElement('meta');
        tag.name = 'description';
        document.head.appendChild(tag);
        return tag;
      })();
    const previousDescription = descriptionTag.getAttribute('content');

    const keywordsTag =
      document.querySelector('meta[name="keywords"]') ||
      (() => {
        const tag = document.createElement('meta');
        tag.name = 'keywords';
        document.head.appendChild(tag);
        return tag;
      })();
    const previousKeywords = keywordsTag.getAttribute('content');

    const ogTitleTag =
      document.querySelector('meta[property="og:title"]') ||
      (() => {
        const tag = document.createElement('meta');
        tag.setAttribute('property', 'og:title');
        document.head.appendChild(tag);
        return tag;
      })();
    const previousOgTitle = ogTitleTag.getAttribute('content');

    const ogDescriptionTag =
      document.querySelector('meta[property="og:description"]') ||
      (() => {
        const tag = document.createElement('meta');
        tag.setAttribute('property', 'og:description');
        document.head.appendChild(tag);
        return tag;
      })();
    const previousOgDescription = ogDescriptionTag.getAttribute('content');

    const baseTitle = 'קטלוג הספרים';
    const baseDescription = 'קטלוג הספרים של ספרי קודש תלפיות';

    if (categoryNames.length) {
      const joined = categoryNames.join(', ');
      const desc = `מבחר ספרים בקטגוריות ${joined}`;
      document.title = `${baseTitle} - ${joined}`;
      descriptionTag.setAttribute('content', desc);
      keywordsTag.setAttribute('content', joined);
      ogTitleTag.setAttribute('content', `${baseTitle} - ${joined}`);
      ogDescriptionTag.setAttribute('content', desc);
    } else {
      const allKeywords = categories.map(c => c.name).join(', ');
      document.title = baseTitle;
      descriptionTag.setAttribute('content', baseDescription);
      keywordsTag.setAttribute('content', allKeywords);
      ogTitleTag.setAttribute('content', baseTitle);
      ogDescriptionTag.setAttribute('content', baseDescription);
    }

    return () => {
      document.title = previousTitle;
      if (previousDescription !== null) descriptionTag.setAttribute('content', previousDescription);
      if (previousKeywords !== null) keywordsTag.setAttribute('content', previousKeywords);
      if (previousOgTitle !== null) ogTitleTag.setAttribute('content', previousOgTitle);
      if (previousOgDescription !== null) ogDescriptionTag.setAttribute('content', previousOgDescription);
    };
  }, [selectedCategories, categories]);

  const applyFilters = (page = 1) => {
    const params = { page, limit: 30 };
    if (searchQuery) params.search = searchQuery;
    if (selectedCategories.length) params.categories = selectedCategories.join(',');
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    filterBooks(params);
  };

  useEffect(() => {
    applyFilters(1);
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
                onClick={() => applyFilters(1)}
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
                onClick={() => navigate(`/books/${book.id}`)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105 cursor-pointer"
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
                {book.image_urls?.length > 1 && (
                  <div className="flex gap-2 p-2 justify-center bg-white">
                    {book.image_urls.slice(1).map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`${book.title} ${idx + 2}`}
                        className="w-16 h-16 object-contain border rounded"
                      />
                    ))}
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-[#112a55] mb-2">{book.title}</h3>
                    {(book.categories?.length || book.category) && (
                      <p className="text-sm text-gray-500 mb-2">
                        קטגוריה:{' '}
                        {(book.categories || [book.category]).map((catName, idx, arr) => {
                          const catObj = categories.find(c => c.name === catName);
                          const content = catObj ? (
                            <a
                              href={`/catalog?categories=${catObj.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {catName}
                            </a>
                          ) : (
                            catName
                          );
                          return (
                            <React.Fragment key={catName + idx}>
                              {content}
                              {idx < arr.length - 1 && ', '}
                            </React.Fragment>
                          );
                        })}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">{book.description}</p>
                    <p className="text-md font-bold text-[#a48327]">{book.price} ₪</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(book);
                      }}
                      className="bg-[#7c1c2c] text-white py-2 px-4 rounded-lg hover:bg-[#66121f] flex items-center gap-2"
                    >
                      <ShoppingCart size={18} /> <span>קנייה מיידית</span>
                    </button>
                    <div className="flex gap-2 text-xl">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 hover:text-green-600"
                        title="הוספה לרשימת משאלות"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => applyFilters(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#7c1c2c] text-white rounded disabled:opacity-50"
              >
                הקודם
              </button>
              <span>
                עמוד {currentPage} מתוך {totalPages}
              </span>
              <button
                onClick={() => applyFilters(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#7c1c2c] text-white rounded disabled:opacity-50"
              >
                הבא
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
