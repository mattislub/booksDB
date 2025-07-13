import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, error } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    
    const result = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password);

    if (result.success) {
      navigate('/user');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6 text-center">
        {isLogin ? 'התחברות' : 'הרשמה'}
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

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#a48327] text-white py-2 rounded hover:bg-[#8b6f1f] transition-colors"
          >
            {isLogin ? 'התחבר' : 'הירשם'}
          </button>

          <p className="text-center text-gray-600">
            {isLogin ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#112a55] hover:underline mr-1"
            >
              {isLogin ? 'הירשם' : 'התחבר'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}