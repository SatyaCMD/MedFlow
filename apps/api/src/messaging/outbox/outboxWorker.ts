import { OutboxModel } from './outbox.model.js';
import { EventBus } from '../eventBus.js';
import { logger } from '../../lib/logger.js';

export class OutboxWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private pollIntervalMs = 1000; // Poll every 1 second

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('📦 Transactional Outbox Poller Worker started.');
    this.scheduleNext();
  }

  private scheduleNext(): void {
    if (!this.isRunning) return;
    this.timer = setTimeout(async () => {
      await this.processOutboxBatch();
      this.scheduleNext();
    }, this.pollIntervalMs);
  }

  public async processOutboxBatch(): Promise<number> {
    try {
      // Find up to 50 PENDING or retryable outbox entries
      const pendingEntries = await OutboxModel.find({
        status: 'PENDING',
        retryCount: { $lt: 5 },
      })
        .sort({ createdAt: 1 })
        .limit(50);

      if (pendingEntries.length === 0) return 0;

      logger.debug({ count: pendingEntries.length }, 'OutboxWorker processing batch...');

      for (const entry of pendingEntries) {
        try {
          entry.status = 'PROCESSING';
          await entry.save();

          await EventBus.publish(entry.eventType, entry.payload, {
            hospitalId: entry.hospitalId,
            correlationId: entry.traceContext.correlationId,
            traceId: entry.traceContext.traceId,
            spanId: entry.traceContext.spanId,
            producer: entry.producer,
          });

          entry.status = 'SENT';
          entry.processedAt = new Date();
          await entry.save();
        } catch (err: any) {
          logger.error({ err, eventId: entry.eventId }, 'Error publishing outbox event. Incrementing retry count.');
          entry.retryCount += 1;
          entry.errorMessage = err?.message || 'Failed to dispatch event';
          entry.status = entry.retryCount >= 5 ? 'FAILED' : 'PENDING';
          await entry.save();
        }
      }

      return pendingEntries.length;
    } catch (err) {
      logger.error({ err }, 'Error querying Outbox collection in OutboxWorker.');
      return 0;
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    logger.info('OutboxWorker stopped.');
  }
}

export const outboxWorker = new OutboxWorker();
