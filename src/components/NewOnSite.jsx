import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { ShoppingCart, ChevronRight, ChevronLeft } from "lucide-react";
import useBooksStore from '../store/booksStore';
import useCartStore from '../store/cartStore';

export const NewOnSite = () => {
  const scrollRef = useRef(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getNewArrivals } = useBooksStore();
  const { addItem } = useCartStore();
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNewArrivals();
        // Duplicate books for infinite scroll
        const repeatedBooks = [...data, ...data, ...data];
        setBooks(repeatedBooks);
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError('שגיאה בטעינת הספרים');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [getNewArrivals]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !isAutoScrolling) return;

    let animationFrameId;
    let lastTime = 0;
    const speed = 0.5;

    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      scrollContainer.scrollLeft += speed * deltaTime;

      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
        scrollContainer.scrollLeft = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [books, isAutoScrolling]);

  const handleScroll = (direction) => {
    setIsAutoScrolling(false);
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollAmount = direction === 'left' ? -300 : 300;
    scrollContainer.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleMouseEnter = () => {
    setIsAutoScrolling(false);
  };

  const handleMouseLeave = () => {
    setIsAutoScrolling(true);
  };

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="w-full overflow-hidden py-4 bg-[#f4ecd6] relative">
      <h2 className="text-2xl font-bold mb-4 text-right text-[#2c1810] border-b-2 border-[#8b6f1f] pb-2 pr-4">חדשים באתר</h2>
      
      <button
        onClick={() => handleScroll('right')}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10 transition-all"
      >
        <ChevronLeft size={24} className="text-[#2c1810]" />
      </button>
      
      <button
        onClick={() => handleScroll('left')}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10 transition-all"
      >
        <ChevronRight size={24} className="text-[#2c1810]" />
      </button>

      <div 
        ref={scrollRef} 
        className="flex gap-6 overflow-x-hidden whitespace-nowrap px-4"
        style={{ scrollBehavior: 'auto' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {books.map((book, index) => (
          <div 
            key={`${book.id}-${index}`} 
            className="flex-shrink-0 w-48 cursor-pointer relative group bg-white rounded-xl shadow-md p-3"
          >
            <Link to={`/books/${book.id}`}>
              <img
                src={book.image_url || `https://via.placeholder.com/300x400.png?text=${encodeURIComponent(book.title)}`}
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
    </div>
  );
}