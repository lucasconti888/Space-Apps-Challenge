import nodemailer from 'nodemailer';

import { env } from '../infrastructure/env';
import { logger } from '../infrastructure/logger';

const transporter = nodemailer.createTransport({
  service: env.email.service,
  auth: {
    user: env.email.from,
    pass: env.email.pass,
  },
});

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<void> {
  const mailOptions = {
    from: `"${env.email.fromName}" <${env.email.from}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('📧 E-mail enviado', { to, messageId: info.messageId });
  } catch (err) {
    logger.error('❌ Falha ao enviar e-mail', { to, error: (err as Error).message });
  }
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const subject = 'Verify your account';
  const text = `Your verification code is: ${code}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2>Verify your account</h2>
      <p>Use the code below to verify your email:</p>
      <h1 style="color: #007bff;">${code}</h1>
      <p>This code will expire in ${env.verification.expiryMinutes} minutes.</p>
    </div>
  `;

  await sendMail(to, subject, text, html);
}
