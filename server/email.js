export function buildEmailTemplate(title, contentHtml) {
  return `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
      </head>
      <body style="font-family:Arial,sans-serif; background-color:#f7f7f7; padding:20px; direction:rtl; text-align:right;">
        <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden;">
          <div style="background-color:#112a55; color:#ffffff; padding:20px; text-align:center;">
            <img src="https://talpiot-books.com/logo.png" alt="תלפיות ספרי קודש" style="max-width:200px; margin-bottom:10px;" />
            <h1 style="margin:0; font-size:24px;">תלפיות ספרי קודש</h1>
          </div>
          <div style="padding:20px; color:#333333;">
            ${contentHtml}
            <div style="margin-top:20px; padding-top:10px; border-top:1px solid #e2e8f0; text-align:center; color:#666;">
              <p style="margin:0;">בברכה,<br/>צוות ספרי קודש תלפיות</p>
              <p style="margin:0;">טלפון: 050-418-1216</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

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
      .map(i => `${i.title || i.id} x${i.quantity} - ₪${Number(i.price).toFixed(2)}`)
      .join('\n');

    const itemsTotal = Number(order.total) - Number(order.shipping_price || 0);
    const text =
      `תודה על הזמנתך!` +
      `\n\nהזמנה #${order.id}` +
      `\nמחיר פריטים: ₪${itemsTotal.toFixed(2)}` +
      `\nדמי משלוח: ₪${Number(order.shipping_price || 0).toFixed(2)}` +
      `\nסה"כ לתשלום: ₪${Number(order.total).toFixed(2)}` +
      `\n\nפריטים:\n${itemsList}`;

    const itemsRows = items
      .map(
        i => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #e2e8f0;">${i.title || i.id}</td>
            <td style="padding:8px; text-align:center; border-bottom:1px solid #e2e8f0;">${i.quantity}</td>
            <td style="padding:8px; text-align:left; border-bottom:1px solid #e2e8f0;">₪${Number(i.price).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const htmlContent = `
      <h2 style="margin-top:0;">תודה על הזמנתך!</h2>
      <p style="font-size:16px;">הזמנה <strong>#${order.id}</strong></p>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr>
            <th style="text-align:right; border-bottom:1px solid #e2e8f0; padding:8px;">פריט</th>
            <th style="text-align:center; border-bottom:1px solid #e2e8f0; padding:8px;">כמות</th>
            <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">מחיר</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:8px; text-align:left; border-top:1px solid #e2e8f0;">מחיר פריטים</td>
            <td style="padding:8px; text-align:left; border-top:1px solid #e2e8f0;">₪${itemsTotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px; text-align:left;">דמי משלוח</td>
            <td style="padding:8px; text-align:left;">₪${Number(order.shipping_price || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px; text-align:left; font-weight:bold;">סה"כ לתשלום</td>
            <td style="padding:8px; text-align:left; font-weight:bold;">₪${Number(order.total).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:20px;">ניצור איתך קשר בהקדם לתיאום תשלום ומשלוח.</p>
    `;

    const html = buildEmailTemplate('אישור הזמנה', htmlContent);

    const from = `"תלפיות ספרי קודש" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
      to: order.email,
      subject: `אישור הזמנה #${order.id}`,
      text,
      html,
    });

    console.log(`Email sent to ${order.email} for order #${order.id}`);
  } catch (err) {
    console.error('Error sending order confirmation email:', err?.message || err);
  }
}

export async function sendContactEmail({ name, email, phone, message }) {
  try {
    const nodemailer = await import('nodemailer');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP configuration missing, skipping contact email send');
      return;
    }

    const to = process.env.CONTACT_EMAIL;
    if (!to) {
      console.warn('CONTACT_EMAIL not set, skipping contact email send');
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

    const text = `שם: ${name}\nדוא"ל: ${email}\nטלפון: ${phone || ''}\n\n${message}`;
    const htmlContent = `
      <h2 style="margin-top:0;">פניית צור קשר חדשה</h2>
      <p><strong>שם:</strong> ${name}</p>
      <p><strong>דוא"ל:</strong> ${email}</p>
      ${phone ? `<p><strong>טלפון:</strong> ${phone}</p>` : ''}
      <p><strong>הודעה:</strong></p>
      <p>${message}</p>
    `;
    const html = buildEmailTemplate('פניית צור קשר', htmlContent);
    const from = `"תלפיות ספרי קודש" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
      to,
      subject: 'פניית צור קשר חדשה',
      text,
      html,
    });

    console.log(`Contact email sent from ${email}`);
  } catch (err) {
    console.error('Error sending contact email:', err?.message || err);
  }
}

export async function sendAdminOrderEmail(order, items = []) {
  const adminEmails = (process.env.ADMIN_ORDER_EMAILS || '6118842@gmail.com,0121718aaa@gmail.com')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

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
      .map(i => `${i.title || i.id} x${i.quantity} - ₪${Number(i.price).toFixed(2)}`)
      .join('\n');

    const itemsTotal = Number(order.total) - Number(order.shipping_price || 0);
    const text =
      `התקבלה הזמנה חדשה #${order.id}` +
      `\nמחיר פריטים: ₪${itemsTotal.toFixed(2)}` +
      `\nדמי משלוח: ₪${Number(order.shipping_price || 0).toFixed(2)}` +
      `\nסה"כ לתשלום: ₪${Number(order.total).toFixed(2)}` +
      `\n\nפריטים:\n${itemsList}` +
      `\n\nניהול הזמנות: https://talpiot-books.com/admin/orders`;

    const itemsRows = items
      .map(
        i => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #e2e8f0;">${i.title || i.id}</td>
            <td style="padding:8px; text-align:center; border-bottom:1px solid #e2e8f0;">${i.quantity}</td>
            <td style="padding:8px; text-align:left; border-bottom:1px solid #e2e8f0;">₪${Number(i.price).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const customerInfo = `
      <p><strong>שם:</strong> ${order.name || ''}</p>
      <p><strong>טלפון:</strong> ${order.phone || ''}</p>
      <p><strong>אימייל:</strong> ${order.email || ''}</p>
      <p><strong>כתובת:</strong> ${order.shipping_address || ''}</p>
      ${order.notes ? `<p><strong>הערות:</strong> ${order.notes}</p>` : ''}
    `;

    const htmlContent = `
      <h2 style="margin-top:0;">התקבלה הזמנה חדשה</h2>
      <p style="font-size:16px;">הזמנה <strong>#${order.id}</strong></p>
      ${customerInfo}
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr>
            <th style="text-align:right; border-bottom:1px solid #e2e8f0; padding:8px;">פריט</th>
            <th style="text-align:center; border-bottom:1px solid #e2e8f0; padding:8px;">כמות</th>
            <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">מחיר</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:8px; text-align:left; border-top:1px solid #e2e8f0;">מחיר פריטים</td>
            <td style="padding:8px; text-align:left; border-top:1px solid #e2e8f0;">₪${itemsTotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px; text-align:left;">דמי משלוח</td>
            <td style="padding:8px; text-align:left;">₪${Number(order.shipping_price || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px; text-align:left; font-weight:bold;">סה"כ לתשלום</td>
            <td style="padding:8px; text-align:left; font-weight:bold;">₪${Number(order.total).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:20px; text-align:center;">
        <a href="https://talpiot-books.com/admin/orders">ניהול הזמנות</a>
      </p>
    `;

    const html = buildEmailTemplate('התקבלה הזמנה חדשה', htmlContent);

    const from = `"תלפיות ספרי קודש" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
      to: adminEmails.join(','),
      subject: `התקבלה הזמנה חדשה #${order.id}`,
      text,
      html,
    });

    console.log(`Admin email sent for order #${order.id}`);
  } catch (err) {
    console.error('Error sending admin order email:', err?.message || err);
  }
}

export async function sendAdminBookMilestoneEmail(total) {
  const adminEmails = (process.env.ADMIN_ORDER_EMAILS || '6118842@gmail.com,0121718aaa@gmail.com')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  try {
    const nodemailer = await import('nodemailer');

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP configuration missing, skipping milestone email send');
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

    const subject = 'השג חדש';
    const text = `האתר מכיל כעת ${total} ספרים.`;
    const htmlContent = `
      <h2 style="margin-top:0;">${subject}</h2>
      <p>האתר מכיל כעת <strong>${total}</strong> ספרים.</p>
    `;
    const html = buildEmailTemplate(subject, htmlContent);

    const from = `"תלפיות ספרי קודש" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
      to: adminEmails.join(','),
      subject,
      text,
      html,
    });

    console.log(`Admin milestone email sent for total books ${total}`);
  } catch (err) {
    console.error('Error sending admin milestone email:', err?.message || err);
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

    const text = `סטטוס הזמנתך מספר ${order.id} עודכן ל: ${statusText}`;

    const htmlContent = `
      <h2 style="margin-top:0;">עדכון סטטוס הזמנה</h2>
      <p>סטטוס הזמנתך מספר <strong>${order.id}</strong> עודכן ל: <strong>${statusText}</strong>.</p>
    `;

    const html = buildEmailTemplate('עדכון סטטוס הזמנה', htmlContent);

    const from = `"תלפיות ספרי קודש" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
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
