import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, TrendingUp } from "lucide-react";

export default function PromoBoxes() {
  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
        <div className="relative h-48 overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg" 
            alt="מבצע מיוחד"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">מבצע מיוחד</h3>
              <p className="text-sm opacity-90">קבלו 20% הנחה על כל ספרי הלכה</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[#a48327]">20% הנחה</span>
            <Link 
              to="/categories" 
              className="flex items-center gap-2 text-[#112a55] hover:text-[#1a3c70] transition-colors"
            >
              <span>לקטלוג</span>
              <ShoppingBag size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
        <div className="relative h-48 overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg" 
            alt="ספרים חדשים"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">חדש על המדף</h3>
              <p className="text-sm opacity-90">ספרים חדשים מגיעים כל שבוע</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[#a48327]">מחירי השקה</span>
            <Link 
              to="/categories" 
              className="flex items-center gap-2 text-[#112a55] hover:text-[#1a3c70] transition-colors"
            >
              <span>לחדשים</span>
              <TrendingUp size={20} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}