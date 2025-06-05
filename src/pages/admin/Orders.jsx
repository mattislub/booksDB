import React, { useState } from 'react';
import { Package, Search, Filter, ChevronDown } from 'lucide-react';

const mockOrders = [
  {
    id: '1',
    date: '2024-03-27',
    customer: 'ישראל ישראלי',
    total: 350,
    status: 'pending',
    items: [
      { title: 'שולחן ערוך', quantity: 1, price: 120 },
      { title: 'משנה ברורה', quantity: 2, price: 115 }
    ]
  },
  {
    id: '2',
    date: '2024-03-26',
    customer: 'יעקב כהן',
    total: 250,
    status: 'completed',
    items: [
      { title: 'סידור תפילה', quantity: 1, price: 250 }
    ]
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'ממתין לטיפול',
  completed: 'הושלם',
  cancelled: 'בוטל'
};

export default function Orders() {
  const [orders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#112a55]">ניהול הזמנות</h1>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="חיפוש הזמנות..."
              className="pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#a48327] focus:border-transparent outline-none"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pr-10 pl-4 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-[#a48327] focus:border-transparent outline-none"
            >
              <option value="all">כל ההזמנות</option>
              <option value="pending">ממתין לטיפול</option>
              <option value="completed">הושלם</option>
              <option value="cancelled">בוטל</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">מספר הזמנה</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">תאריך</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">לקוח</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">סכום</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">סטטוס</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr 
                key={order.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-[#a48327]" />
                    <span>#{order.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{new Date(order.date).toLocaleDateString('he-IL')}</td>
                <td className="px-6 py-4">{order.customer}</td>
                <td className="px-6 py-4">{order.total} ₪</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#a48327] hover:text-[#8b6f1f]">
                    פרטים
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#112a55]">
                הזמנה #{selectedOrder.id}
              </h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">פרטי לקוח</h3>
                  <p>{selectedOrder.customer}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">תאריך הזמנה</h3>
                  <p>{new Date(selectedOrder.date).toLocaleDateString('he-IL')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">פריטים</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.title} (x{item.quantity})</span>
                      <span>{item.price * item.quantity} ₪</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>סה"כ</span>
                  <span>{selectedOrder.total} ₪</span>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button className="px-4 py-2 border rounded hover:bg-gray-50">
                  הדפס
                </button>
                <button className="px-4 py-2 bg-[#a48327] text-white rounded hover:bg-[#8b6f1f]">
                  עדכן סטטוס
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}