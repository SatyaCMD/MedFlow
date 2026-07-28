import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
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
    logger.warn(`SMTP server unavailable on ${env.SMTP_HOST}:${env.SMTP_PORT} (${error.message}). Email dispatch will fallback to dev log mode.`);
  } else {
    logger.info(`SMTP Server connection established successfully on ${env.SMTP_HOST}:${env.SMTP_PORT}.`);
  }
});

export interface MailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: MailAttachment[];
}

export const sendMail = async (options: MailOptions): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: '"MediCore 360" <no-reply@medicore360.com>',
      to: options.to,
      subject: options.subject,
      text: options.text || (options.html ? options.html.replace(/<[^>]*>?/gm, '') : ''),
      html: options.html,
      attachments: options.attachments,
    });

    logger.info({ messageId: info.messageId, to: options.to, subject: options.subject }, '✉️ Email dispatched successfully via SMTP.');
  } catch (err: any) {
    console.log('\n================== [MEDIFLOW EMAIL DISPATCH TELEMETRY] ==================');
    console.log(`TO: ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    if (options.attachments && options.attachments.length > 0) {
      console.log(`ATTACHMENTS: ${options.attachments.map(a => a.filename).join(', ')}`);
    }
    console.log('------------------------------------------------------------------------');
    console.log(options.text || (options.html ? options.html.replace(/<[^>]*>?/gm, '') : ''));
    console.log('========================================================================\n');

    logger.warn(
      { to: options.to, subject: options.subject, reason: err.message },
      '⚠️ SMTP server offline. Logged email telemetry to server console.'
    );
  }
};
