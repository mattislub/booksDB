import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, User, ShoppingCart, Search, MessageCircle, Grid, X } from "lucide-react";
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useContentStore from '../store/contentStore';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { openCart, getItemsCount } = useCartStore();
  const { getContent } = useContentStore();
  const [phone, setPhone] = useState('');
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    getContent('phone_number').then((val) => setPhone(val || ''));
  }, [getContent]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/972504181216', '_blank');
  };

  return (
    <header className="w-full shadow-lg font-serif text-right bg-white">
      <div className="bg-[#f8f6f1] text-sm text-[#8b6f1f] px-6 py-2 flex justify-between items-center border-b">
        <nav className="flex gap-6">
          <Link to="/" className="hover:text-[#a48327] transition">ראשי</Link>
          <Link to="/about" className="hover:text-[#a48327] transition">אודותינו</Link>
          <Link to="/categories" className="hover:text-[#a48327] transition">קטגוריות</Link>
          <Link to="/contact" className="hover:text-[#a48327] transition">יצירת קשר</Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-xs">משלוח חינם בקנייה מעל 250 ₪</span>
          <span className="text-xs border-r pr-4">הנחת מזומן 10%</span>
        </div>
      </div>

      <div className="py-6 px-6">
        <div className="flex flex-col items-center gap-6">
          <Link to="/" className="flex flex-col justify-center items-center gap-2">
            <img
              src="/logo.png"
              alt="ספרי קודש תלפיות"
              className="h-48 object-contain"
              style={{ filter: 'brightness(0.85)' }}
            />
            <p className="text-[#112a55] text-2xl font-bold tracking-wide" style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>המקום המושלם לספרי קודש במחירים נוחים</p>
          </Link>

          <div className="flex gap-8 items-center">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setShowContactPopup(true)}
                className="w-16 h-16 bg-[#112a55] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1a3c70] transition-colors"
              >
                <MessageCircle size={32} className="text-white" />
              </button>
              <span className="text-[#a48327]">יצירת קשר</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Link
                to="/categories"
                className="w-16 h-16 bg-[#112a55] rounded-full flex items-center justify-center shadow-lg hover:bg-[#1a3c70] transition-colors"
              >
                <Grid size={32} className="text-white" />
              </Link>
              <span className="text-[#a48327]">כל הקטגוריות</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#112a55] text-white px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
        <form onSubmit={handleSearch} className="flex w-full max-w-md relative">
          <input
            type="text"
            placeholder="חפש ספרים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pr-10 rounded-lg text-black text-sm border-2 border-transparent focus:border-[#a48327] outline-none transition-all duration-200"
          />
          <button 
            type="submit" 
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#a48327] transition-colors"
          >
            <Search size={20} />
          </button>
        </form>

        <div className="flex items-center gap-6 text-lg">
          <div className="flex items-center gap-2 text-[#f9e79f]">
            <Phone size={20} strokeWidth={1.5} className="rotate-90" />
            <span>{phone}</span>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/user" className="hover:text-yellow-400">
                <User size={20} strokeWidth={1.5} />
              </Link>
              <button onClick={signOut} className="text-sm hover:text-yellow-400">
                התנתק
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-yellow-400">
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}
          <button 
            onClick={openCart}
            title="סל קניות" 
            className="relative hover:text-yellow-400"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
              {getItemsCount()}
            </span>
          </button>
        </div>
      </div>

      {showContactPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowContactPopup(false)}
              className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-[#112a55] mb-6">יצירת קשר</h2>

            <div className="space-y-4">
              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={24} />
                <span>שלח הודעת WhatsApp</span>
              </button>

              <Link
                to="/contact"
                onClick={() => setShowContactPopup(false)}
                className="w-full bg-[#112a55] text-white py-3 rounded-lg hover:bg-[#1a3c70] transition-colors flex items-center justify-center"
              >
                השאר הודעה
              </Link>

              <p className="text-center text-gray-500 text-sm">
                אנו מתחייבים לחזור אליך תוך יום עסקים אחד
              </p>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}