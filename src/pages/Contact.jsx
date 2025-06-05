import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('שולח...');
    
    // Simulate form submission
    setTimeout(() => {
      setStatus('ההודעה נשלחה בהצלחה!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">צור קשר</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#a48327] mb-4">פרטי התקשרות</h2>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-bold">כתובת:</h3>
              <p>רחוב הרב קוק 12, ירושלים</p>
            </div>
            
            <div>
              <h3 className="font-bold">טלפון:</h3>
              <p>050-418-1216</p>
            </div>
            
            <div>
              <h3 className="font-bold">שעות פעילות:</h3>
              <p>ימים א'-ה': 9:00-20:00</p>
              <p>יום ו': 9:00-13:00</p>
            </div>
            
            <div>
              <h3 className="font-bold">דוא"ל:</h3>
              <p>info@talpiot-books.co.il</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#a48327] mb-4">טופס יצירת קשר</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1">שם מלא</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1">דוא"ל</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-1">טלפון</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-gray-700 mb-1">הודעה</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full border rounded p-2"
              />
            </div>

            <button
              type="submit"
              className="bg-[#a48327] text-white py-2 px-6 rounded hover:bg-[#8b6f1f] transition-colors"
            >
              שלח הודעה
            </button>

            {status && (
              <p className="text-green-600 text-center">{status}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}