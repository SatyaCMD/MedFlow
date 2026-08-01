import amqp, { Channel } from 'amqplib';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { RABBITMQ_EXCHANGES, RABBITMQ_QUEUES, EventEnvelope } from '@medicore360/shared';

class RabbitMQEngine {
  private connection: any = null;
  private channel: Channel | null = null;
  private isConnecting = false;

  public async getChannel(): Promise<Channel | null> {
    if (!env.ENABLE_RABBITMQ) {
      logger.info('ℹ️ RabbitMQ is disabled/deferred for local environment. Fallback to outbox storage active.');
      return null;
    }

    if (this.channel) return this.channel;

    if (this.isConnecting) {
      await new Promise((res) => setTimeout(res, 500));
      return this.getChannel();
    }

    this.isConnecting = true;

    try {
      const conn = await amqp.connect(env.RABBITMQ_URI);
      this.connection = conn;
      const ch = await conn.createChannel();
      this.channel = ch;

      conn.on('error', (err: any) => {
        logger.error({ err }, 'RabbitMQ connection error occurred.');
        this.channel = null;
        this.connection = null;
      });

      conn.on('close', () => {
        logger.warn('RabbitMQ connection closed. Will reconnect on demand.');
        this.channel = null;
        this.connection = null;
      });

      await this.setupExchangesAndQueues(ch);
      this.isConnecting = false;
      logger.info('🚀 RabbitMQ Broker initialized with Direct, Topic, Fanout exchanges and DLQ.');
      return ch;
    } catch (err) {
      this.isConnecting = false;
      logger.info('ℹ️ RabbitMQ broker connection deferred. Fallback to outbox storage active.');
      return null;
    }
  }

  private async setupExchangesAndQueues(ch: Channel): Promise<void> {
    // 1. Declare Exchanges
    await ch.assertExchange(RABBITMQ_EXCHANGES.DIRECT, 'direct', { durable: true });
    await ch.assertExchange(RABBITMQ_EXCHANGES.TOPIC, 'topic', { durable: true });
    await ch.assertExchange(RABBITMQ_EXCHANGES.FANOUT, 'fanout', { durable: true });
    await ch.assertExchange(RABBITMQ_EXCHANGES.DEAD_LETTER, 'direct', { durable: true });

    // 2. Declare Dead Letter Queue (DLQ)
    await ch.assertQueue(RABBITMQ_QUEUES.DLQ, { durable: true });
    await ch.bindQueue(RABBITMQ_QUEUES.DLQ, RABBITMQ_EXCHANGES.DEAD_LETTER, 'dlq.routing.key');

    // 3. Declare Standard Queues with DLQ binding & retry policies
    const queueOptions = {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': RABBITMQ_EXCHANGES.DEAD_LETTER,
        'x-dead-letter-routing-key': 'dlq.routing.key',
      },
    };

    const queues = [
      RABBITMQ_QUEUES.EMAIL_NOTIFICATIONS,
      RABBITMQ_QUEUES.SMS_NOTIFICATIONS,
      RABBITMQ_QUEUES.PUSH_NOTIFICATIONS,
      RABBITMQ_QUEUES.AUDIT_LOGS,
      RABBITMQ_QUEUES.ACCOUNTING_PROCESS,
      RABBITMQ_QUEUES.ANALYTICS_SYNC,
    ];

    for (const q of queues) {
      await ch.assertQueue(q, queueOptions);
      await ch.bindQueue(q, RABBITMQ_EXCHANGES.DIRECT, q);
    }

    // 4. Priority Queue for Emergency Alerts
    await ch.assertQueue(RABBITMQ_QUEUES.EMERGENCY_PRIORITY, {
      durable: true,
      arguments: {
        'x-max-priority': 10,
        'x-dead-letter-exchange': RABBITMQ_EXCHANGES.DEAD_LETTER,
        'x-dead-letter-routing-key': 'dlq.routing.key',
      },
    });
    await ch.bindQueue(RABBITMQ_QUEUES.EMERGENCY_PRIORITY, RABBITMQ_EXCHANGES.DIRECT, RABBITMQ_QUEUES.EMERGENCY_PRIORITY);
  }

  public async publishToQueue<T = any>(queueName: string, envelope: EventEnvelope<T>, priority = 0): Promise<boolean> {
    try {
      const ch = await this.getChannel();
      if (!ch) {
        logger.debug({ queueName, eventId: envelope.eventId }, 'RabbitMQ offline. Event routed to outbox storage.');
        return false;
      }
      const payload = Buffer.from(JSON.stringify(envelope));
      return ch.sendToQueue(queueName, payload, {
        persistent: true,
        priority,
        headers: {
          correlationId: envelope.traceContext.correlationId,
          eventType: envelope.eventType,
        },
      });
    } catch (err) {
      logger.error({ err, queueName, eventId: envelope.eventId }, 'Failed to publish message to RabbitMQ queue.');
      return false;
    }
  }

  public async consumeQueue<T = any>(queueName: string, onMessage: (envelope: EventEnvelope<T>) => Promise<void>): Promise<void> {
    const ch = await this.getChannel();
    if (!ch) return;

    await ch.prefetch(10); // Fair dispatching across worker instances

    await ch.consume(queueName, async (msg) => {
      if (!msg) return;
      try {
        const envelope: EventEnvelope<T> = JSON.parse(msg.content.toString());
        await onMessage(envelope);
        ch.ack(msg);
      } catch (err) {
        logger.error({ err, queueName }, 'Error consuming RabbitMQ message. Requeuing or sending to DLQ.');
        const headers = msg.properties?.headers || {};
        const deathHeader = headers['x-death'];
        const count = deathHeader && deathHeader[0] ? deathHeader[0].count : 0;

        if (count >= 3) {
          logger.warn({ queueName }, 'Max retry attempts exceeded. Nack to DLQ.');
          ch.nack(msg, false, false); // Route to Dead Letter Queue
        } else {
          ch.nack(msg, false, true); // Requeue for retry
        }
      }
    });

    logger.info({ queueName }, 'RabbitMQ Queue Consumer listening.');
  }

  public async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      logger.info('RabbitMQ connection closed cleanly.');
    } catch (err) {
      logger.error({ err }, 'Error closing RabbitMQ connection.');
    }
  }
}

export const rabbitMQEngine = new RabbitMQEngine();
