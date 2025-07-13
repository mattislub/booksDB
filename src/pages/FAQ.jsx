import React, { useEffect, useState } from 'react';
import useContentStore from '../store/contentStore';

export default function FAQ() {
  const { getContent } = useContentStore();
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    getContent('faq').then((val) => {
      try {
        const parsed = JSON.parse(val || '[]');
        setFaqs(Array.isArray(parsed) ? parsed : []);
      } catch {
        setFaqs([]);
      }
    });
  }, [getContent]);

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