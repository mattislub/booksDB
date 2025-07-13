import React from 'react';
import { Navigate, Link, Routes, Route } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import UserProfile from '../components/UserProfile';
import UserOrders from '../components/UserOrders';
import UserWishlist from '../components/UserWishlist';

export default function UserArea() {
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
            <Link
              to="/user"
              className="block py-2 px-4 rounded hover:bg-gray-100 transition"
            >
              פרופיל
            </Link>
            <Link
              to="/user/orders"
              className="block py-2 px-4 rounded hover:bg-gray-100 transition"
            >
              הזמנות
            </Link>
            <Link
              to="/user/wishlist"
              className="block py-2 px-4 rounded hover:bg-gray-100 transition"
            >
              רשימת משאלות
            </Link>
          </nav>
        </div>

        <div className="md:col-span-3 bg-white rounded-xl shadow-lg p-6">
          <Routes>
            <Route index element={<UserProfile />} />
            <Route path="orders" element={<UserOrders />} />
            <Route path="wishlist" element={<UserWishlist />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}