import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword, error } = useAuthStore();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await resetPassword(token, password);
    if (result.success) {
      setMessage('הסיסמה עודכנה בהצלחה');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6 text-center">איפוס סיסמה</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-1">
              סיסמה חדשה
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          <button
            type="submit"
            className="w-full bg-[#a48327] text-white py-2 rounded hover:bg-[#8b6f1f] transition-colors"
          >
            שמור
          </button>
        </form>
      </div>
    </div>
  );
}

