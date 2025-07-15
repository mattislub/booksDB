import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { apiGet, apiPost } from '../lib/apiClient';
import useAuthStore from '../store/authStore';

export default function PersonalWishlist() {
  const { user } = useAuthStore();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet('/api/wishlist');
      setWishlist(data || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('שגיאה בטעינת רשימת המשאלות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const removeItem = async (id) => {
    try {
      setError(null);
      await apiPost(`/api/wishlist/${id}/delete`, {});
      await loadWishlist();
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('שגיאה במחיקה מרשימת המשאלות');
    }
  };

  if (loading) {
    return <div className="text-center py-4">טוען רשימת משאלות...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={loadWishlist} className="text-[#112a55] hover:underline">
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#112a55] mb-6">רשימת המשאלות שלי</h2>
      {wishlist.length === 0 ? (
        <p className="text-gray-600">רשימת המשאלות ריקה</p>
      ) : (
        <div className="grid gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <img
                src={item.book.image_url || `https://via.placeholder.com/200x300.png?text=${encodeURIComponent(item.book.title)}`}
                alt={item.book.title}
                className="w-20 h-28 object-contain rounded"
              />
              <div className="flex-1">
                <Link to={`/books/${item.book.id}`} className="font-bold text-[#112a55] hover:text-[#1a3c70] transition-colors">
                  {item.book.title}
                </Link>
                {item.book.author && (
                  <p className="text-gray-600 text-sm">{item.book.author}</p>
                )}
                <p className="text-[#a48327] font-bold mt-1">{item.book.price} ₪</p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                title="הסר מרשימת המשאלות"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
