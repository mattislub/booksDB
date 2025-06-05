import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CouponPopup({ onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('שולח...');
    
    // Simulate sending email
    setTimeout(() => {
      setStatus('הקופון נשלח לכתובת המייל שלך!');
      localStorage.setItem('couponShown', 'true');
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative animate-slide-up shadow-2xl">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#112a55] mb-4">🎉 מבצע מיוחד!</h2>
          <p className="text-gray-600 text-lg mb-4">הירשם עכשיו וקבל:</p>
          <ul className="text-[#a48327] font-bold space-y-2 text-xl">
            <li className="bg-[#fdf6ec] py-2 px-4 rounded-lg">משלוח חינם בקנייה הראשונה</li>
            <li className="bg-[#fdf6ec] py-2 px-4 rounded-lg">10% הנחה על כל ההזמנה</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="הכנס את כתובת המייל שלך"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#a48327] focus:ring-2 focus:ring-[#a48327] focus:ring-opacity-50 outline-none transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#a48327] text-white py-3 rounded-lg hover:bg-[#8b6f1f] transition-colors text-lg font-semibold transform hover:scale-105 transition-transform duration-200"
          >
            קבל קופון
          </button>

          {status && (
            <p className="text-center text-green-600 font-semibold animate-fade-in">
              {status}
            </p>
          )}

          <p className="text-center text-gray-500 text-sm mt-4">
            * הקופון תקף לשבוע מיום קבלתו
          </p>
        </form>
      </div>
    </div>
  );
}