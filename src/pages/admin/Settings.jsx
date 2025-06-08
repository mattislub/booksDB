import React, { useState } from 'react';
import { apiPost } from '../../lib/apiClient';

export default function Settings() {
  const [status, setStatus] = useState('');

  const handleSetup = async () => {
    try {
      setStatus('running');
      await apiPost('/api/setup', {});
      setStatus('success');
    } catch (err) {
      console.error('Setup error:', err);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">הגדרות מערכת</h1>
      <button
        onClick={handleSetup}
        className="bg-[#a48327] text-white px-4 py-2 rounded hover:bg-[#8b6f1f]"
      >
        צור טבלאות במסד הנתונים
      </button>
      {status === 'running' && <p className="mt-4">יוצר טבלאות...</p>}
      {status === 'success' && (
        <p className="mt-4 text-green-600">הטבלאות נוצרו בהצלחה</p>
      )}
      {status === 'error' && (
        <p className="mt-4 text-red-600">שגיאה ביצירת הטבלאות</p>
      )}
    </div>
  );
}
