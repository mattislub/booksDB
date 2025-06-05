import React from 'react';

export default function FAQ() {
  const faqs = [
    {
      question: "מהם זמני המשלוח?",
      answer: "משלוח רגיל: 3-5 ימי עסקים. משלוח מהיר: עד 24 שעות."
    },
    {
      question: "האם יש משלוח חינם?",
      answer: "כן, בקנייה מעל 250 ₪ המשלוח חינם."
    },
    {
      question: "מה מדיניות ההחזרות?",
      answer: "ניתן להחזיר מוצרים עד 14 יום מיום הקבלה, כל עוד המוצר במצב חדש."
    },
    {
      question: "האם ניתן לאסוף עצמאית מהחנות?",
      answer: "כן, ניתן לאסוף מהחנות בשעות הפעילות ללא עלות משלוח."
    },
    {
      question: "איך ניתן ליצור קשר?",
      answer: "ניתן ליצור קשר בטלפון 050-418-1216 או במייל info@talpiot-books.co.il"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">שאלות נפוצות</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
              <h2 className="text-xl font-bold text-[#a48327] mb-2">
                {faq.question}
              </h2>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}