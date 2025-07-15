import React from 'react';
import { Navigate, Link, Routes, Route } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import PersonalProfile from '../components/PersonalProfile';
import PersonalOrders from '../components/PersonalOrders';
import PersonalWishlist from '../components/PersonalWishlist';

export default function PersonalArea() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">אזור אישי</h1>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <nav className="space-y-2">
            <Link to="/personal" className="block py-2 px-4 rounded hover:bg-gray-100 transition">
              פרופיל
            </Link>
            <Link to="/personal/orders" className="block py-2 px-4 rounded hover:bg-gray-100 transition">
              הזמנות
            </Link>
            <Link to="/personal/wishlist" className="block py-2 px-4 rounded hover:bg-gray-100 transition">
              רשימת משאלות
            </Link>
          </nav>
        </div>

        <div className="md:col-span-3 bg-white rounded-xl shadow-lg p-6">
          <Routes>
            <Route index element={<PersonalProfile />} />
            <Route path="orders" element={<PersonalOrders />} />
            <Route path="wishlist" element={<PersonalWishlist />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
