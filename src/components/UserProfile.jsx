import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';

export default function UserProfile() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setStatus('שגיאה בטעינת הפרופיל');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('שומר שינויים...');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date()
        });

      if (error) throw error;
      setStatus('הפרטים נשמרו בהצלחה!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setStatus('שגיאה בשמירת הפרטים');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#112a55] mb-6">פרטים אישיים</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-700 mb-1">
            שם מלא
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 mb-1">
            דוא"ל
          </label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-gray-700 mb-1">
            טלפון
          </label>
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
          <label htmlFor="address" className="block text-gray-700 mb-1">
            כתובת
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-[#a48327] text-white py-2 px-6 rounded hover:bg-[#8b6f1f] transition-colors"
        >
          שמור שינויים
        </button>

        {status && (
          <p className={status.includes('שגיאה') ? 'text-red-600' : 'text-green-600'}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
}