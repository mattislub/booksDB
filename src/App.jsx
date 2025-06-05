import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Catalog from "./components/Catalog";
import Header from "./components/Header";
import PromoBoxes from "./components/PromoBoxes";
import { NewOnSite } from './components/NewOnSite';
import { NewInMarket } from './components/NewInMarket';
import CategoriesView from "./components/CategoriesView";
import BookDetails from "./components/BookDetails";
import NotFound from "./components/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import UserArea from "./pages/UserArea";
import Checkout from "./pages/Checkout";
import Terms from "./pages/Terms";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Reports from "./pages/admin/Reports";
import CouponPopup from "./components/CouponPopup";
import ShoppingCart from "./components/ShoppingCart";
import useAuthStore from "./store/authStore";
import useCartStore from "./store/cartStore";
import { Phone, Mail, Clock } from "lucide-react";

function App() {
  const { initialize: initAuth } = useAuthStore();
  const { initialize: initCart } = useCartStore();
  const [showCoupon, setShowCoupon] = useState(false);

  useEffect(() => {
    initAuth();
    initCart();
  }, [initAuth, initCart]);

  useEffect(() => {
    const couponShown = localStorage.getItem('couponShown');
    if (!couponShown) {
      const timer = setTimeout(() => {
        setShowCoupon(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Router>
      <div dir="rtl" className="font-serif bg-[#f8f6f1] min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-12">
                  <section className="bg-white rounded-2xl shadow-lg p-4">
                    <NewOnSite />
                  </section>
                  
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PromoBoxes />
                  </section>
                  
                  <section className="bg-white rounded-2xl shadow-lg p-4">
                    <NewInMarket />
                  </section>
                  
                  <section className="bg-white rounded-2xl shadow-lg p-8">
                    <Catalog />
                  </section>
                </div>
              }
            />
            <Route path="/categories" element={<CategoriesView />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user/*" element={<UserArea />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="bg-[#112a55] text-white py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#1a3c70] rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-[#f9e79f] text-center">צור קשר</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Phone size={20} className="rotate-90 text-[#f9e79f]" />
                    <span>050-418-1216</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Mail size={20} className="text-[#f9e79f]" />
                    <span>info@talpiot-books.co.il</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Clock size={20} className="text-[#f9e79f]" />
                    <span>א'-ה' 9:00-20:00</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1a3c70] rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-[#f9e79f] text-center">שירותים</h3>
                <ul className="space-y-3 text-center">
                  <li className="hover:text-[#f9e79f] transition-colors">
                    <Link to="/shipping">משלוחים לכל הארץ</Link>
                  </li>
                  <li className="hover:text-[#f9e79f] transition-colors">
                    <Link to="/contact">הזמנות מיוחדות</Link>
                  </li>
                  <li className="hover:text-[#f9e79f] transition-colors">
                    <Link to="/contact">כריכה ותיקון ספרים</Link>
                  </li>
                  <li className="hover:text-[#f9e79f] transition-colors">
                    <Link to="/contact">ייעוץ מקצועי</Link>
                  </li>
                </ul>
              </div>
              
              <div className="bg-[#1a3c70] rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-[#f9e79f] text-center">מידע נוסף</h3>
                <ul className="space-y-3 text-center">
                  <li className="hover:text-[#f9e79f] transition-colors">
                    <Link to="/terms">תקנון האתר</Link>
                  </li>
                  <li className="hover:text-[#f9e79f] transition-colors">
                    <Link to="/shipping">מדיניות משלוחים</Link>
                  </li>
                  <li className="hover:text-[#f9e79f] transition-colors">
                    <Link to="/returns">מדיניות החזרות</Link>
                  </li>
                  <li className="hover:text-[#f9e79f] transition-colors">
                    <Link to="/faq">שאלות נפוצות</Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-6 border-t border-[#1a3c70] text-center">
              <p>© כל הזכויות שמורות לספרי קודש תלפיות</p>
            </div>
          </div>
        </footer>

        {showCoupon && <CouponPopup onClose={() => setShowCoupon(false)} />}
        <ShoppingCart />
      </div>
    </Router>
  );
}

export default App;