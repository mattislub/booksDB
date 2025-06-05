import React from 'react';

export default function Returns() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">מדיניות החזרות</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">תנאי החזרה</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>ניתן להחזיר מוצרים עד 14 יום מיום הקבלה</li>
            <li>המוצר חייב להיות במצב חדש וללא פגיעה</li>
            <li>יש לשמור את חשבונית הקנייה</li>
            <li>ההחזר הכספי יבוצע באמצעי התשלום המקורי</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">תהליך ההחזרה</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>יש ליצור קשר עם שירות הלקוחות</li>
            <li>קבלת אישור החזרה</li>
            <li>שליחת המוצר בחזרה לחנות</li>
            <li>בדיקת המוצר וביצוע ההחזר הכספי</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">החזר כספי</h2>
          <p className="text-gray-700 leading-relaxed">
            ההחזר הכספי יבוצע תוך 14 ימי עסקים מיום קבלת המוצר בחנות.
          </p>
        </section>
      </div>
    </div>
  );
}