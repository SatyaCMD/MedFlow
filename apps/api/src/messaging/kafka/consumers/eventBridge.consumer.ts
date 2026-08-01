import { kafkaEngine } from '../kafka.client.js';
import { KAFKA_TOPICS, EventEnvelope } from '@medicore360/shared';
import { socketServer } from '../../../realtime/socketServer.js';
import { logger } from '../../../lib/logger.js';

export class RealtimeEventBridge {
  private groupId = 'medflow-realtime-bridge-group';

  public async start(): Promise<void> {
    try {
      const topics = Object.values(KAFKA_TOPICS);
      const consumer = await kafkaEngine.createConsumer(this.groupId, topics, async (_topic, envelope) => {
        await this.relayEventToWebSockets(envelope);
      });
      if (consumer) {
        logger.info('🌉 Real-time Event Bridge Consumer connected & relaying Kafka events to WebSockets.');
      } else {
        logger.info('🌉 Real-time Event Bridge: Local Socket.IO bridge active (Kafka consumer skipped).');
      }
    } catch (err) {
      logger.warn({ err }, 'Real-time Event Bridge Consumer fallback activated.');
    }
  }

  public async relayEventToWebSockets(envelope: EventEnvelope): Promise<void> {
    try {
      socketServer.broadcastEvent(envelope);
    } catch (err) {
      logger.error({ err, eventId: envelope.eventId }, 'Error relaying event to Socket.IO gateway.');
    }
  }
}

export const realtimeEventBridge = new RealtimeEventBridge();
