import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-sm bg-white p-4 rounded-lg shadow-lg z-40 flex items-center gap-4 animate-slide-up">
      <p className="text-sm text-gray-700 flex-1">
        אנו משתמשים בעוגיות כדי לשפר את חוויית הגלישה שלך.
      </p>
      <button
        onClick={acceptCookies}
        className="bg-[#a48327] text-white px-4 py-2 rounded-lg hover:bg-[#8b6f1f] transition-colors text-sm"
      >
        אישור
      </button>
    </div>
  );
}
