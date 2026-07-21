import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: env.SMTP_USER
    ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      }
    : undefined,
});

// Verify connection configuration on startup
transporter.verify((error) => {
  if (error) {
    logger.error({ err: error }, 'SMTP Connection verification failed.');
  } else {
    logger.info(`SMTP Server connection established successfully on ${env.SMTP_HOST}:${env.SMTP_PORT}.`);
  }
});

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendMail = async (options: MailOptions): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: '"MediCore 360" <no-reply@medicore360.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    logger.info({ messageId: info.messageId, to: options.to }, 'Email sent successfully.');
  } catch (err) {
    logger.error({ err, to: options.to }, 'Failed to dispatch email.');
    throw err;
  }
};
