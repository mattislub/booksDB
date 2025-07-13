import React, { useEffect, useState } from 'react';
import useContentStore from '../store/contentStore';

export default function About() {
  const { getContent } = useContentStore();
  const [content, setContent] = useState('');

  useEffect(() => {
    getContent('about_page').then((val) => setContent(val || ''));
  }, [getContent]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">אודות ספרי קודש תלפיות</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}