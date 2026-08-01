import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { OutboxModel } from './outbox.model.js';
import { EventTraceContext } from '@medicore360/shared';
import { logger } from '../../lib/logger.js';

export class OutboxService {
  public static async recordEvent(
    eventType: string,
    hospitalId: string,
    payload: Record<string, any>,
    traceContext?: Partial<EventTraceContext>,
    session?: mongoose.ClientSession
  ): Promise<void> {
    try {
      const eventId = uuidv4();
      const correlationId = traceContext?.correlationId || uuidv4();

      const outboxDoc = new OutboxModel({
        eventId,
        eventType,
        eventVersion: '1.0',
        hospitalId,
        producer: 'medflow-api',
        payload,
        traceContext: {
          correlationId,
          traceId: traceContext?.traceId,
          spanId: traceContext?.spanId,
        },
        status: 'PENDING',
      });

      if (session) {
        await outboxDoc.save({ session });
      } else {
        await outboxDoc.save();
      }

      logger.debug({ eventId, eventType, hospitalId }, 'Recorded event in Transactional Outbox.');
    } catch (err) {
      logger.error({ err, eventType, hospitalId }, 'Failed to record event in Outbox.');
    }
  }
}
