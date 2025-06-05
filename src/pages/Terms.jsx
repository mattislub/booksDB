import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">תקנון האתר</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">כללי</h2>
          <p className="text-gray-700 leading-relaxed">
            תקנון זה מסדיר את תנאי השימוש באתר ספרי קודש תלפיות. השימוש באתר מהווה הסכמה לתנאים אלו.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">רכישה באתר</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>המחירים באתר כוללים מע"מ</li>
            <li>התשלום מתבצע במעמד ההזמנה</li>
            <li>ניתן לבטל עסקה בתוך 14 יום</li>
            <li>הספרים נשלחים באריזה מאובטחת</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">פרטיות</h2>
          <p className="text-gray-700 leading-relaxed">
            אנו מתחייבים לשמור על פרטיות הלקוחות ולא להעביר מידע לצד שלישי ללא הסכמה מפורשת.
          </p>
        </section>
      </div>
    </div>
  );
}