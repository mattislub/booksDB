import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import useBooksStore from '../store/booksStore';
import useCartStore from '../store/cartStore';

export const NewInMarket = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getNewInMarket } = useBooksStore();
  const { addItem } = useCartStore();
  const [page, setPage] = useState(0);
  const booksPerPage = 3;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNewInMarket();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching new in market books:', err);
        setError('שגיאה בטעינת הספרים');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [getNewInMarket]);

  const totalPages = Math.ceil(books.length / booksPerPage);
  const displayedBooks = books.slice(
    page * booksPerPage,
    page * booksPerPage + booksPerPage
  );

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="w-full py-6 bg-[#f4ecd6]">
      <h2 className="text-2xl font-bold mb-6 text-right text-[#2c1810] border-b-2 border-[#8b6f1f] pb-2 pr-4">חדשים בשוק</h2>
      <div className="flex gap-8 justify-center px-4">
        {displayedBooks.map(book => (
          <div key={book.id} className="w-48 cursor-pointer relative group bg-white rounded-xl shadow-md p-3">
            <Link to={`/books/${book.id}`}>
              <img
                src={book.image_url ? book.image_url : `https://via.placeholder.com/300x400.png?text=${encodeURIComponent(book.title)}`}
                alt={book.title}
                className="w-full h-32 object-cover rounded-lg shadow group-hover:opacity-90 transition-opacity"
              />
              <p className="text-center mt-3 font-serif text-lg text-[#2c1810]">{book.title}</p>
              <p className="text-center text-[#8b6f1f] font-bold mt-1">{book.price} ₪</p>
            </Link>
            <button
              onClick={() => addItem(book)}
              className="absolute bottom-0 left-0 right-0 bg-[#7c1c2c] text-white py-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-b-xl"
            >
              <ShoppingCart size={16} />
              הוסף לסל
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full transition-colors ${idx === page ? 'bg-[#2c1810]' : 'bg-[#8b6f1f]'} hover:bg-[#2c1810]`}
            onClick={() => setPage(idx)}
          />
        ))}
      </div>
    </div>
  );
}