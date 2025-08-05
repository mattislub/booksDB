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
      .map(i => `${i.title || i.id} x${i.quantity} - $${i.price}`)
      .join('\n');

    const text = `Thanks for your order!\n\nOrder #${order.id}\nTotal: ${order.total}\n\nItems:\n${itemsList}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: order.email,
      subject: `Order Confirmation #${order.id}`,
      text,
    });

    console.log(`Email sent to ${order.email} for order #${order.id}`);
  } catch (err) {
    console.error('Error sending order confirmation email:', err?.message || err);
  }
}
