import React, { useState } from 'react';

const sampleOrder = {
  orderNumber: "ABC12345",
  customerName: "ישראל ישראלי",
  customerEmail: "israel@example.com",
  customerPhone: "050-1234567",
  items: [
    { title: "שולחן ערוך", quantity: 1, price: 120 },
    { title: "משנה ברורה", quantity: 2, price: 110 }
  ],
  total: 340,
  shippingAddress: "רחוב הרצל 1, תל אביב"
};

export default function EmailPreview() {
  const [orderData, setOrderData] = useState(sampleOrder);
  const [emailType, setEmailType] = useState('customer');

  const emailHeader = `
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://talpiot-books.co.il/logo.png" alt="ספרי קודש תלפיות" style="max-width: 200px; margin-bottom: 15px;" />
      <div style="color: #666; font-size: 14px;">
        <p>טלפון: 050-418-1216</p>
        <p>רחוב הרב קוק 12, ירושלים</p>
      </div>
    </div>
  `;

  const customerTemplate = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${emailHeader}
      <h2 style="color: #112a55;">תודה על הזמנתך!</h2>
      <p>שלום ${orderData.customerName},</p>
      <p>הזמנתך התקבלה בהצלחה. להלן פרטי ההזמנה:</p>
      
      <div style="background: #f8f6f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #a48327; margin-top: 0;">פריטים:</h3>
        <ul style="list-style: none; padding: 0;">
          ${orderData.items.map(item => `
            <li style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              ${item.title} - ${item.quantity} יח' - ${item.price} ₪
            </li>
          `).join('')}
        </ul>
        
        <p style="font-weight: bold; text-align: left; margin-top: 15px;">
          סה"כ לתשלום: ${orderData.total} ₪
        </p>
      </div>
      
      <div style="background: #f8f6f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #a48327; margin-top: 0;">פרטי משלוח:</h3>
        <p style="margin: 0;">כתובת: ${orderData.shippingAddress}</p>
        <p style="margin: 0;">טלפון: ${orderData.customerPhone}</p>
      </div>
      
      <p>ניצור איתך קשר בהקדם לתיאום המשלוח.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f8f6f1;">
        <p>בברכה,<br>צוות ספרי קודש תלפיות</p>
      </div>
    </div>
  `;

  const storeTemplate = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${emailHeader}
      <h2 style="color: #112a55;">התקבלה הזמנה חדשה</h2>
      <p style="font-size: 1.2em; color: #a48327;">מספר הזמנה: ${orderData.orderNumber}</p>
      
      <div style="background: #f8f6f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #a48327; margin-top: 0;">פרטי לקוח:</h3>
        <p>שם: ${orderData.customerName}</p>
        <p>אימייל: ${orderData.customerEmail}</p>
        <p>טלפון: ${orderData.customerPhone}</p>
        <p style="margin-bottom: 0;">כתובת: ${orderData.shippingAddress}</p>
      </div>
      
      <div style="background: #f8f6f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #a48327; margin-top: 0;">פריטים:</h3>
        <ul style="list-style: none; padding: 0;">
          ${orderData.items.map(item => `
            <li style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              ${item.title} - ${item.quantity} יח' - ${item.price} ₪
            </li>
          `).join('')}
        </ul>
        
        <p style="font-weight: bold; text-align: left; margin-top: 15px;">
          סה"כ: ${orderData.total} ₪
        </p>
      </div>
    </div>
  `;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-6">תצוגה מקדימה של תבנית המייל</h1>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setEmailType('customer')}
          className={`px-4 py-2 rounded ${
            emailType === 'customer'
              ? 'bg-[#112a55] text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          מייל ללקוח
        </button>
        <button
          onClick={() => setEmailType('store')}
          className={`px-4 py-2 rounded ${
            emailType === 'store'
              ? 'bg-[#112a55] text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          מייל לחנות
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b p-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="font-bold">נושא:</span>
            <span>
              {emailType === 'customer' 
                ? `הזמנה מספר ${orderData.orderNumber} התקבלה בהצלחה`
                : `הזמנה חדשה - ${orderData.orderNumber}`
              }
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold">אל:</span>
            <span>
              {emailType === 'customer' 
                ? orderData.customerEmail
                : 'orders@talpiot-books.co.il'
              }
            </span>
          </div>
        </div>
        
        <div 
          className="p-8"
          dangerouslySetInnerHTML={{ 
            __html: emailType === 'customer' ? customerTemplate : storeTemplate 
          }} 
        />
      </div>
    </div>
  );
}