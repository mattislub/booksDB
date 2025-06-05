import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import useAuthStore from '../store/authStore';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items (
              *,
              book:books (
                title,
                price
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('שגיאה בטעינת ההזמנות');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return <div>טוען הזמנות...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#112a55] mb-6">ההזמנות שלי</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">עדיין אין הזמנות</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">הזמנה #{order.id.slice(0, 8)}</span>
                <span className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('he-IL')}
                </span>
              </div>
              
              <div className="space-y-2">
                {order.order_items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.book.title} (x{item.quantity})</span>
                    <span>{item.price} ₪</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold">סה"כ: {order.total} ₪</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
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