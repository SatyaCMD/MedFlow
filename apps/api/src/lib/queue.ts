import { Queue, QueueEvents } from 'bullmq';
import { redis } from './redis.js';
import { logger } from './logger.js';

const connectionOptions = {
  connection: redis,
};

export const emailQueue = new Queue('email', connectionOptions);
export const pdfQueue = new Queue('pdf', connectionOptions);
export const notificationQueue = new Queue('notification', connectionOptions);
export const auditQueue = new Queue('audit', connectionOptions);
export const reportQueue = new Queue('report', connectionOptions);

// Log queue failures
const emailQueueEvents = new QueueEvents('email', connectionOptions);
emailQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Email job failed.');
});

const pdfQueueEvents = new QueueEvents('pdf', connectionOptions);
pdfQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'PDF job failed.');
});

const notificationQueueEvents = new QueueEvents('notification', connectionOptions);
notificationQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Notification job failed.');
});

const auditQueueEvents = new QueueEvents('audit', connectionOptions);
auditQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Audit job failed.');
});

logger.info('BullMQ enterprise background queues initialized successfully.');
