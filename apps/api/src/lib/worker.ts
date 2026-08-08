import { Worker, Job } from 'bullmq';
import { redis } from './redis.js';
import { logger } from './logger.js';

const connectionOptions = {
  connection: redis,
};

export const startBackgroundWorkers = (): void => {
  logger.info('🚀 Starting high-concurrency BullMQ background worker engine...');

  // 1. Email Worker (Concurrency: 20)
  const emailWorker = new Worker(
    'email',
    async (job: Job) => {
      logger.info({ jobId: job.id, name: job.name }, 'Processing background email job');
      // Job processing logic
    },
    { ...connectionOptions, concurrency: 20 }
  );

  // 2. PDF Worker (Concurrency: 10)
  const pdfWorker = new Worker(
    'pdf',
    async (job: Job) => {
      logger.info({ jobId: job.id, name: job.name }, 'Processing background PDF generation job');
    },
    { ...connectionOptions, concurrency: 10 }
  );

  // 3. Notification Worker (Concurrency: 25)
  const notificationWorker = new Worker(
    'notification',
    async (job: Job) => {
      logger.info({ jobId: job.id, name: job.name }, 'Processing background notification job');
    },
    { ...connectionOptions, concurrency: 25 }
  );

  // 4. Audit Worker (Concurrency: 50)
  const auditWorker = new Worker(
    'audit',
    async (job: Job) => {
      logger.info({ jobId: job.id, name: job.name }, 'Processing background audit log job');
    },
    { ...connectionOptions, concurrency: 50 }
  );

  emailWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Email worker failed job.'));
  pdfWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'PDF worker failed job.'));
  notificationWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Notification worker failed job.'));
  auditWorker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Audit worker failed job.'));
};
