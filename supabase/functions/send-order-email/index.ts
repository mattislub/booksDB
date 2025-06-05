import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderData } = await req.json() as { orderData: OrderEmailData };

    const transporter = new SmtpClient({
      host: Deno.env.get("SMTP_HOST"),
      port: Number(Deno.env.get("SMTP_PORT")),
      secure: true,
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
    });

    const emailHeader = `
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://talpiot-books.co.il/logo.png" alt="ספרי קודש תלפיות" style="max-width: 200px; margin-bottom: 15px;" />
        <div style="color: #666; font-size: 14px;">
          <p>טלפון: 050-418-1216</p>
          <p>רחוב הרב קוק 12, ירושלים</p>
        </div>
      </div>
    `;

    // Send email to customer
    await transporter.sendMail({
      from: '"ספרי קודש תלפיות" <info@talpiot-books.co.il>',
      to: orderData.customerEmail,
      subject: `הזמנה מספר ${orderData.orderNumber} התקבלה בהצלחה`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          ${emailHeader}
          <h2>תודה על הזמנתך!</h2>
          <p>שלום ${orderData.customerName},</p>
          <p>הזמנתך התקבלה בהצלחה. להלן פרטי ההזמנה:</p>
          
          <h3>פריטים:</h3>
          <ul>
            ${orderData.items.map(item => `
              <li>${item.title} - ${item.quantity} יח' - ${item.price} ₪</li>
            `).join('')}
          </ul>
          
          <p><strong>סה"כ לתשלום: ${orderData.total} ₪</strong></p>
          
          <h3>פרטי משלוח:</h3>
          <p>כתובת: ${orderData.shippingAddress}</p>
          <p>טלפון: ${orderData.customerPhone}</p>
          
          <p>ניצור איתך קשר בהקדם לתיאום המשלוח.</p>
          
          <p>בברכה,<br>צוות ספרי קודש תלפיות</p>
        </div>
      `,
    });

    // Send notification to store
    await transporter.sendMail({
      from: '"מערכת הזמנות" <system@talpiot-books.co.il>',
      to: "orders@talpiot-books.co.il",
      subject: `הזמנה חדשה - ${orderData.orderNumber}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          ${emailHeader}
          <h2>התקבלה הזמנה חדשה</h2>
          
          <h3>פרטי לקוח:</h3>
          <p>שם: ${orderData.customerName}</p>
          <p>אימייל: ${orderData.customerEmail}</p>
          <p>טלפון: ${orderData.customerPhone}</p>
          <p>כתובת: ${orderData.shippingAddress}</p>
          
          <h3>פריטים:</h3>
          <ul>
            ${orderData.items.map(item => `
              <li>${item.title} - ${item.quantity} יח' - ${item.price} ₪</li>
            `).join('')}
          </ul>
          
          <p><strong>סה"כ: ${orderData.total} ₪</strong></p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});