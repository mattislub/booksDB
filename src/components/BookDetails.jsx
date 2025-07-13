import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Package, Clock, Shield } from "lucide-react";
import useBooksStore from '../store/booksStore';
import useCartStore from '../store/cartStore';

export default function BookDetails() {
  const { id } = useParams();
  const { books, loading, error } = useBooksStore();
  const { addItem } = useCartStore();
  const book = books.find(b => b.id === parseInt(id));

  const relatedBooks = useMemo(() => {
    if (!book) return [];
    return books
      .filter(b => b.category === book.category && b.id !== book.id)
      .slice(0, 4);
  }, [books, book]);

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!book) return <div className="text-center py-8">הספר לא נמצא</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Link to="/" className="text-[#112a55] hover:text-[#1a3c70] transition-colors mb-6 inline-flex items-center gap-2">
        ← חזרה לקטלוג
      </Link>

      {/* Main Product Section */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-12">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Image Section */}
          <div className="flex items-center justify-center bg-[#f8f6f1] rounded-xl p-8">
            <img
              src={book.image_url || `https://via.placeholder.com/400x600.png?text=${encodeURIComponent(book.title)}`}
              alt={book.title}
              className="max-h-[500px] object-contain rounded-lg shadow-lg"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[#112a55] mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{book.author || "מחבר לא ידוע"}</p>
              <div className="flex items-center gap-2 text-[#a48327]">
                <span className="text-sm bg-[#fdf6ec] px-3 py-1 rounded-full">
                  {book.category}
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed border-t border-b border-gray-100 py-4">
              {book.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-[#a48327]">{book.price} ₪</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                book.availability === "available" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {book.availability === "available" ? "✓ במלאי" : "× אזל מהמלאי"}
              </span>
            </div>

            <button 
              onClick={() => book.availability === "available" && addItem(book)}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300 ${
                book.availability === "available"
                  ? "bg-[#7c1c2c] text-white hover:bg-[#66121f] transform hover:scale-105"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              disabled={book.availability !== "available"}
            >
              <ShoppingCart size={24} />
              הוסף לסל הקניות
            </button>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Package className="mx-auto text-[#112a55] mb-2" size={24} />
                <span className="text-sm">משלוח חינם</span>
              </div>
              <div className="text-center">
                <Clock className="mx-auto text-[#112a55] mb-2" size={24} />
                <span className="text-sm">משלוח מהיר</span>
              </div>
              <div className="text-center">
                <Shield className="mx-auto text-[#112a55] mb-2" size={24} />
                <span className="text-sm">אחריות מלאה</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-[#112a55] mb-6">ספרים דומים</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map(relatedBook => (
              <div 
                key={relatedBook.id} 
                className="bg-[#f8f6f1] rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <Link to={`/books/${relatedBook.id}`}>
                  <img
                    src={relatedBook.image_url || `https://via.placeholder.com/200x300.png?text=${encodeURIComponent(relatedBook.title)}`}
                    alt={relatedBook.title}
                    className="w-full h-48 object-contain mb-4"
                  />
                  <h3 className="font-bold text-[#112a55] mb-1">{relatedBook.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{relatedBook.author}</p>
                  <p className="text-[#a48327] font-bold mb-3">{relatedBook.price} ₪</p>
                </Link>
                <button 
                  onClick={() => addItem(relatedBook)}
                  className="w-full bg-[#7c1c2c] text-white py-2 rounded-lg hover:bg-[#66121f] flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  הוסף לסל
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}