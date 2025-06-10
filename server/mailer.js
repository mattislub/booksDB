import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendMail({ to, subject, html }) {
  if (!transporter.options.host) {
    console.warn('Mailer not configured: missing MAIL_HOST');
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
}

export default transporter;
