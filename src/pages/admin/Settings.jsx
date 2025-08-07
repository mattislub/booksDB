import React, { useState, useEffect } from 'react';
import { apiPost } from '../../lib/apiClient';
import useSettingsStore from '../../store/settingsStore';

export default function Settings() {
  const [status, setStatus] = useState('');
  const [shippingPrice, setShippingPrice] = useState('');
  const [shippingStatus, setShippingStatus] = useState('');
  const { getSetting, updateSetting } = useSettingsStore();

  useEffect(() => {
    getSetting('default_shipping_price').then((val) => setShippingPrice(val || ''));
  }, [getSetting]);

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

  const handleSaveShipping = async () => {
    const result = await updateSetting('default_shipping_price', shippingPrice);
    setShippingStatus(result.success ? 'saved' : 'error');
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">הגדרות משלוח</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            className="border rounded px-3 py-2 w-40"
            value={shippingPrice}
            onChange={(e) => setShippingPrice(e.target.value)}
            placeholder="מחיר משלוח"
          />
          <button
            onClick={handleSaveShipping}
            className="bg-[#a48327] text-white px-4 py-2 rounded hover:bg-[#8b6f1f]"
          >
            שמור
          </button>
        </div>
        {shippingStatus === 'saved' && (
          <p className="text-green-600 mt-2">נשמר בהצלחה</p>
        )}
        {shippingStatus === 'error' && (
          <p className="text-red-600 mt-2">שגיאה בשמירה</p>
        )}
      </div>
    </div>
  );
}
