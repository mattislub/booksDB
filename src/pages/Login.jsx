import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, requestPasswordReset, error } = useAuthStore();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    let result;
    if (mode === 'login') {
      result = await signIn(email, password);
      if (result.success) navigate('/personal');
    } else if (mode === 'register') {
      result = await signUp(email, password);
      if (result.success) navigate('/personal');
    } else {
      result = await requestPasswordReset(email);
      if (result.success) setMessage('אם הכתובת קיימת, נשלח קישור לאיפוס סיסמה');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6 text-center">
        {mode === 'login' ? 'התחברות' : mode === 'register' ? 'הרשמה' : 'שחזור סיסמה'}
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              דוא"ל
            </label>
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

          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">
                סיסמה
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            className="w-full bg-[#a48327] text-white py-2 rounded hover:bg-[#8b6f1f] transition-colors"
          >
            {mode === 'login' ? 'התחבר' : mode === 'register' ? 'הירשם' : 'שלח קישור'}
          </button>

          <p className="text-center text-gray-600">
            {mode === 'login'
              ? 'אין לך חשבון?'
              : mode === 'register'
              ? 'כבר יש לך חשבון?'
              : 'נזכרת בסיסמה?'}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[#112a55] hover:underline mr-1"
            >
              {mode === 'login' ? 'הירשם' : 'התחבר'}
            </button>
          </p>
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setMode('reset');
                setMessage('');
              }}
              className="text-[#112a55] hover:underline block mx-auto mt-2"
            >
              שכחת סיסמה?
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

