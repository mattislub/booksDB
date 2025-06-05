import React from 'react';

export default function Shipping() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">מדיניות משלוחים</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">זמני משלוח</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>משלוח רגיל: 3-5 ימי עסקים</li>
            <li>משלוח מהיר: עד 24 שעות</li>
            <li>איסוף עצמי: זמין בשעות פעילות החנות</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">עלויות משלוח</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>משלוח חינם בקנייה מעל 250 ₪</li>
            <li>משלוח רגיל: 25 ₪</li>
            <li>משלוח מהיר: 45 ₪</li>
            <li>איסוף עצמי: ללא עלות</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">אזורי חלוקה</h2>
          <p className="text-gray-700 leading-relaxed">
            אנו מספקים משלוחים לכל רחבי הארץ. זמני המשלוח עשויים להשתנות בהתאם למיקום.
          </p>
        </section>
      </div>
    </div>
  );
}