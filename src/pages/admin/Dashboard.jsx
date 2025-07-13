import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, CreditCard, BarChart2, Tag, Settings, Mail, FolderTree } from 'lucide-react';

const menuItems = [
  {
    title: 'ניהול מוצרים',
    icon: Package,
    link: '/admin/products',
    description: 'ניהול מלאי, הוספה ועריכת ספרים'
  },
  {
    title: 'ניהול הזמנות',
    icon: CreditCard,
    link: '/admin/orders',
    description: 'צפייה וטיפול בהזמנות'
  },
  {
    title: 'ניהול משתמשים',
    icon: Users,
    link: '/admin/users',
    description: 'ניהול משתמשים והרשאות'
  },
  {
    title: 'ניהול קטגוריות',
    icon: FolderTree,
    link: '/admin/categories',
    description: 'ניהול קטגוריות וקטגוריות משנה'
  },
  {
    title: 'מבצעים והנחות',
    icon: Tag,
    link: '/admin/promotions',
    description: 'ניהול מבצעים וקופונים'
  },
  {
    title: 'דוחות וסטטיסטיקות',
    icon: BarChart2,
    link: '/admin/reports',
    description: 'נתוני מכירות ודוחות'
  },
  {
    title: 'תבניות מייל',
    icon: Mail,
    link: '/admin/email-preview',
    description: 'תצוגה מקדימה של תבניות מייל'
  },
  {
    title: 'הגדרות',
    icon: Settings,
    link: '/admin/settings',
    description: 'הגדרות כלליות'
  }
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-8">לוח בקרה</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.link}
              to={item.link}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#f8f6f1] rounded-lg">
                  <Icon className="text-[#a48327]" size={24} />
                </div>
                <h2 className="text-xl font-bold text-[#112a55]">{item.title}</h2>
              </div>
              <p className="text-gray-600">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}