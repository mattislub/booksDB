export async function sendOrderEmail(order, items = []) {
  if (!order?.email) return;

  try {
    const nodemailer = await import('nodemailer');
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP configuration missing, skipping email send');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT) || 10000,
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 10000,
      debug: true,
    });

    await transporter.verify();

    const itemsList = items
      .map(i => `${i.title || i.id} x${i.quantity} - $${Number(i.price).toFixed(2)}`)
      .join('\n');

    const text = `Thanks for your order!\n\nOrder #${order.id}\nTotal: $${Number(order.total).toFixed(2)}\n\nItems:\n${itemsList}`;

    const itemsRows = items
      .map(
        i => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #e2e8f0;">${i.title || i.id}</td>
            <td style="padding:8px; text-align:center; border-bottom:1px solid #e2e8f0;">${i.quantity}</td>
            <td style="padding:8px; text-align:right; border-bottom:1px solid #e2e8f0;">$${Number(i.price).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Order Confirmation</title>
        </head>
        <body style="font-family:Arial,sans-serif; background-color:#f7f7f7; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden;">
            <div style="background-color:#112a55; color:#ffffff; padding:20px;">
              <h1 style="margin:0; font-size:24px;">Thank you for your order!</h1>
            </div>
            <div style="padding:20px; color:#333333;">
              <p style="font-size:16px;">Order <strong>#${order.id}</strong></p>
              <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                <thead>
                  <tr>
                    <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">Item</th>
                    <th style="text-align:center; border-bottom:1px solid #e2e8f0; padding:8px;">Qty</th>
                    <th style="text-align:right; border-bottom:1px solid #e2e8f0; padding:8px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:8px; text-align:right; font-weight:bold; border-top:1px solid #e2e8f0;">Total</td>
                    <td style="padding:8px; text-align:right; font-weight:bold; border-top:1px solid #e2e8f0;">$${Number(order.total).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              <p style="margin-top:20px;">We will contact you soon to arrange payment and delivery.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: order.email,
      subject: `Order Confirmation #${order.id}`,
      text,
      html,
    });

    console.log(`Email sent to ${order.email} for order #${order.id}`);
  } catch (err) {
    console.error('Error sending order confirmation email:', err?.message || err);
  }
}

export async function sendOrderStatusEmail(order) {
  if (!order?.email) return;

  try {
    const nodemailer = await import('nodemailer');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP configuration missing, skipping email send');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT) || 10000,
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 10000,
      debug: true,
    });

    await transporter.verify();

    const statusLabels = {
      pending: 'ממתין לטיפול',
      completed: 'הושלם',
      cancelled: 'בוטל',
    };
    const statusText = statusLabels[order.status] || order.status;

    const text = `הזמנתך מספר ${order.id} עודכנה לסטטוס: ${statusText}`;
    const html = `<p>${text}</p>`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: order.email,
      subject: `עדכון סטטוס הזמנה #${order.id}`,
      text,
      html,
    });

    console.log(`Status update email sent to ${order.email} for order #${order.id}`);
  } catch (err) {
    console.error('Error sending status update email:', err?.message || err);
  }
}
