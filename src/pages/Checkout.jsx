import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { apiPost } from '../lib/apiClient';
import { Phone, Mail, MapPin } from 'lucide-react';
import useSettingsStore from '../store/settingsStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { getSetting } = useSettingsStore();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    phone: user?.user_metadata?.phone || '',
    email: user?.email || '',
    address: user?.user_metadata?.address || '',
    notes: ''
  });
  const [status, setStatus] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);

  useEffect(() => {
    getSetting('default_shipping_price').then((val) =>
      setShippingPrice(Number(val) || 0)
    );
  }, [getSetting]);

  if (items.length === 0 && !showThankYou) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-[#112a55] mb-4">העגלה ריקה</h2>
        <button
          onClick={() => navigate('/')}
          className="text-[#a48327] hover:text-[#8b6f1f]"
        >
          חזרה לחנות
        </button>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <h2 className="text-3xl font-bold text-[#112a55]">תודה על הקנייה!</h2>
          <p className="text-xl text-[#a48327]">ההזמנה התקבלה בהצלחה</p>
          <div className="text-gray-600 space-y-2">
            <p>שלחנו לך אימייל עם פרטי ההזמנה.</p>
            <p>ניצור איתך קשר בהקדם לתיאום התשלום והמשלוח.</p>
          </div>
          <div className="pt-6 border-t">
            <p className="text-lg font-semibold text-[#112a55] mb-4">המשך יום נעים!</p>
            <p className="text-gray-500">נתראה שוב בקרוב 😊</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-[#a48327] text-white py-3 px-8 rounded-lg hover:bg-[#8b6f1f] transition-colors"
          >
            חזרה לחנות
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('שולח הזמנה...');

    try {
      await apiPost("/api/orders", {
        items,
        total: getTotal(),
        shipping_address: formData.address,
        phone: formData.phone,
        notes: formData.notes,
        email: formData.email,
        name: formData.name
      });

      setStatus("ההזמנה התקבלה בהצלחה!");
      clearCart();
      setShowThankYou(true);
    } catch (error) {
      console.error('Error creating order:', error);
      setStatus('שגיאה בשליחת ההזמנה. אנא נסה שוב.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-8">סיום הזמנה</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* טופס פרטים */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#a48327] mb-6">פרטי התקשרות</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1">
                שם מלא *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#a48327] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-1">
                טלפון *
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#a48327] focus:border-transparent outline-none"
                  placeholder="050-1234567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1">
                דוא"ל *
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#a48327] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-gray-700 mb-1">
                כתובת למשלוח *
              </label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#a48327] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-gray-700 mb-1">
                הערות להזמנה
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#a48327] focus:border-transparent outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#7c1c2c] text-white py-3 rounded-lg hover:bg-[#66121f] transition-colors text-lg font-bold mt-6"
            >
              שלח הזמנה
            </button>

            {status && (
              <div className="text-center mt-4 text-green-600 font-semibold">
                {status}
              </div>
            )}
          </form>
        </div>

        {/* סיכום הזמנה */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#a48327] mb-6">פרטי ההזמנה</h2>
          
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                <img
                  src={
                    item.image_urls?.[0] ||
                    item.image_url ||
                    `https://via.placeholder.com/100x150.png?text=${encodeURIComponent(item.title)}`
                  }
                  alt={item.title}
                  className="w-20 h-28 object-contain bg-white rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-[#112a55]">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.author}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[#a48327] font-bold">{item.price} ₪</span>
                    <span className="text-gray-600">כמות: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-6 space-y-2">
              <div className="flex justify-between items-center">
                <span>מחיר פריטים:</span>
                <span>{getTotal()} ₪</span>
              </div>
              <div className="flex justify-between items-center">
                <span>דמי משלוח:</span>
                <span>{shippingPrice} ₪</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>סה"כ לתשלום:</span>
                <span className="text-[#7c1c2c]">{getTotal() + shippingPrice} ₪</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                * התשלום יתבצע במעמד המסירה או בשיחה טלפונית
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}