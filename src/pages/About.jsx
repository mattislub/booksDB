import React from 'react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">אודות ספרי קודש תלפיות</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">מי אנחנו</h2>
          <p className="text-gray-700 leading-relaxed">
            חנות ספרי קודש תלפיות הוקמה בשנת תש"פ מתוך מטרה להנגיש ספרי קודש איכותיים במחירים הוגנים.
            החנות שלנו מתמחה במגוון רחב של ספרי קודש, מהדורות מיוחדות, וספרי לימוד לכל הגילאים.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">המטרה שלנו</h2>
          <p className="text-gray-700 leading-relaxed">
            אנו שואפים להיות הכתובת המועדפת לרכישת ספרי קודש, תוך הקפדה על:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2 text-gray-700">
            <li>איכות מוצרים גבוהה</li>
            <li>שירות לקוחות מצוין</li>
            <li>מחירים הוגנים</li>
            <li>מבחר עשיר ומתחדש</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#a48327] mb-3">שירותים נוספים</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>הזמנות מיוחדות של ספרים</li>
            <li>משלוחים לכל הארץ</li>
            <li>כריכה ותיקון ספרים</li>
            <li>ייעוץ מקצועי בבחירת ספרים</li>
          </ul>
        </section>
      </div>
    </div>
  );
}