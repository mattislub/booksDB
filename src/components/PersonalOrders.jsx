import React, { useEffect, useState } from 'react';
import { apiGet } from '../lib/apiClient';
import useAuthStore from '../store/authStore';

export default function PersonalOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await apiGet('/api/orders');
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('שגיאה בטעינת ההזמנות');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadOrders();
    }
  }, [user]);

  if (loading) return <div>טוען הזמנות...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#112a55] mb-6">ההזמנות שלי</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">עדיין אין הזמנות</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">הזמנה #{String(order.id).slice(0, 8)}</span>
                <span className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('he-IL')}
                </span>
              </div>
              <div className="space-y-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    {item.book && (
                      <img
                        src={
                          item.book.image_url ||
                          `https://via.placeholder.com/60x90.png?text=${encodeURIComponent(item.book.title)}`
                        }
                        alt={item.book.title}
                        className="w-12 h-16 object-contain rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.book ? item.book.title : 'פריט לא זמין'}
                      </p>
                      {item.book?.author && (
                        <p className="text-sm text-gray-600">{item.book.author}</p>
                      )}
                      <p className="text-sm text-gray-600">כמות: {item.quantity}</p>
                    </div>
                    <span className="font-bold">{item.price} ₪</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold">סה"כ: {order.total} ₪</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {order.status === 'completed' ? 'הושלם' : 'בטיפול'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
