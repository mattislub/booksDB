import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';

const mockData = {
  sales: [
    { name: 'ינואר', amount: 12500 },
    { name: 'פברואר', amount: 15000 },
    { name: 'מרץ', amount: 18000 },
  ],
  topProducts: [
    { name: 'שולחן ערוך', sales: 25 },
    { name: 'משנה ברורה', sales: 20 },
    { name: 'סידור תפילה', sales: 15 },
  ],
  summary: {
    totalSales: 45500,
    ordersCount: 150,
    averageOrder: 303
  }
};

export default function Reports() {
  const [dateRange, setDateRange] = useState('month');
  const [data] = useState(mockData);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#112a55]">דוחות וסטטיסטיקות</h1>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pr-10 pl-4 py-2 border rounded-lg appearance-none bg-white"
            >
              <option value="week">שבוע אחרון</option>
              <option value="month">חודש אחרון</option>
              <option value="year">שנה אחרונה</option>
            </select>
          </div>
          
          <button className="flex items-center gap-2 bg-[#a48327] text-white px-4 py-2 rounded-lg hover:bg-[#8b6f1f]">
            <Download size={20} />
            ייצא דוח
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">סה"כ מכירות</h3>
          <p className="text-3xl font-bold text-[#112a55]">{data.summary.totalSales} ₪</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">מספר הזמנות</h3>
          <p className="text-3xl font-bold text-[#112a55]">{data.summary.ordersCount}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">ממוצע להזמנה</h3>
          <p className="text-3xl font-bold text-[#112a55]">{data.summary.averageOrder} ₪</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[#112a55] mb-6">מכירות לפי חודש</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#a48327" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-[#112a55] mb-6">מוצרים מובילים</h2>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-[#a48327]">#{index + 1}</span>
                  <span>{product.name}</span>
                </div>
                <span className="font-semibold">{product.sales} יחידות</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}