import { Queue, QueueEvents } from 'bullmq';
import { redis } from './redis.js';
import { logger } from './logger.js';

const connectionOptions = {
  // connection is shared with our global Redis client
  connection: redis,
};

export const emailQueue = new Queue('email', connectionOptions);
export const pdfQueue = new Queue('pdf', connectionOptions);

// Log queue failures
const emailQueueEvents = new QueueEvents('email', connectionOptions);
emailQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Email job failed.');
});

const pdfQueueEvents = new QueueEvents('pdf', connectionOptions);
pdfQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'PDF job failed.');
});

logger.info('BullMQ worker queues initialized successfully.');
