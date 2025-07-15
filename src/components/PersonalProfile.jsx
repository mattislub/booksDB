import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/apiClient';
import useAuthStore from '../store/authStore';

export default function PersonalProfile() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await apiGet('/api/profile');
        if (data) {
          setForm({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setStatus('שגיאה בטעינה');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadProfile();
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('שומר...');
    try {
      await apiPost('/api/profile', { id: user.id, ...form });
      setStatus('נשמר בהצלחה');
    } catch (err) {
      console.error('Error saving profile:', err);
      setStatus('שגיאה בשמירה');
    }
  };

  if (loading) return <div>טוען...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#112a55] mb-6">פרטים אישיים</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-700 mb-1">
            שם מלא
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
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
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={onChange}
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
            rows="3"
            value={form.address}
            onChange={onChange}
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
          <p className={status.includes('שגיאה') ? 'text-red-600' : 'text-green-600'}>{status}</p>
        )}
      </form>
    </div>
  );
}
