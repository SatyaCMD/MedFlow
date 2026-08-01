import { Kafka, Producer, Consumer, KafkaConfig, Partitioners, logLevel } from 'kafkajs';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { KAFKA_TOPICS, EventEnvelope } from '@medicore360/shared';

class KafkaEngine {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private isConnected = false;
  private enabled: boolean;

  constructor() {
    this.enabled = env.ENABLE_KAFKA;
    if (!this.enabled) {
      this.kafka = null;
      return;
    }

    const brokers = env.KAFKA_BROKERS.split(',').map((b) => b.trim());
    const config: KafkaConfig = {
      clientId: 'medflow-hospital-platform',
      brokers,
      logLevel: logLevel.NOTHING, // Suppress verbose raw KafkaJS stdout connection error dumps
      retry: {
        initialRetryTime: 100,
        retries: env.NODE_ENV === 'production' ? 5 : 1,
      },
    };

    this.kafka = new Kafka(config);
  }

  public async connectProducer(): Promise<Producer | null> {
    if (!this.enabled || !this.kafka) {
      logger.info('ℹ️ Apache Kafka is disabled/deferred for local environment. Relying on RabbitMQ & Outbox Queue.');
      return null;
    }

    if (this.producer && this.isConnected) return this.producer;

    try {
      this.producer = this.kafka.producer({
        createPartitioner: Partitioners.DefaultPartitioner,
        idempotent: true,
        maxInFlightRequests: 5,
      });

      await this.producer.connect();
      this.isConnected = true;
      logger.info('🚀 Apache Kafka Producer connected with Idempotence enabled.');
      await this.ensureTopicsExist();
      return this.producer;
    } catch (err) {
      logger.warn('Failed to connect Kafka Producer. Relying on RabbitMQ or Outbox queue fallback.');
      return null;
    }
  }

  private async ensureTopicsExist(): Promise<void> {
    if (!this.kafka) return;
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      const existingTopics = await admin.listTopics();
      const requiredTopics = Object.values(KAFKA_TOPICS);

      const topicsToCreate = requiredTopics
        .filter((t) => !existingTopics.includes(t))
        .map((t) => ({
          topic: t,
          numPartitions: 3,
          replicationFactor: 1,
        }));

      if (topicsToCreate.length > 0) {
        await admin.createTopics({ topics: topicsToCreate });
        logger.info({ topics: topicsToCreate.map((t) => t.topic) }, 'Created missing Kafka topics.');
      }
      await admin.disconnect();
    } catch (err) {
      logger.warn({ err }, 'Kafka admin topic check failed or non-critical.');
    }
  }

  public async publishEvent<T = any>(topic: string, envelope: EventEnvelope<T>): Promise<void> {
    if (!this.enabled || !this.kafka) {
      logger.debug({ topic, eventType: envelope.eventType }, 'Kafka disabled. Event dispatched via alternative queue.');
      return;
    }

    try {
      const prod = await this.connectProducer();
      if (!prod) return;

      await prod.send({
        topic,
        messages: [
          {
            key: envelope.hospitalId || envelope.eventId,
            value: JSON.stringify(envelope),
            headers: {
              correlationId: envelope.traceContext.correlationId,
              eventType: envelope.eventType,
              producer: envelope.producer,
            },
          },
        ],
      });
      logger.debug({ topic, eventType: envelope.eventType, eventId: envelope.eventId }, 'Kafka message published successfully.');
    } catch (err) {
      logger.error({ err, topic, eventId: envelope.eventId }, 'Kafka message publishing failed.');
    }
  }

  public async createConsumer(groupId: string, topics: string[], onMessage: (topic: string, envelope: EventEnvelope) => Promise<void>): Promise<Consumer | null> {
    if (!this.enabled || !this.kafka) {
      logger.info({ groupId }, 'Kafka consumer group skipped (Kafka disabled in local dev).');
      return null;
    }

    try {
      const consumer = this.kafka.consumer({ groupId });
      await consumer.connect();

      for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: false });
      }

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          if (!message.value) return;
          try {
            const envelope: EventEnvelope = JSON.parse(message.value.toString());
            await onMessage(topic, envelope);
          } catch (msgErr) {
            logger.error({ err: msgErr, topic, partition }, 'Error processing Kafka message in consumer.');
          }
        },
      });

      this.consumers.set(groupId, consumer);
      logger.info({ groupId, topics }, 'Kafka Consumer Group connected & listening.');
      return consumer;
    } catch (err) {
      logger.warn({ groupId, topics }, 'Failed to initialize Kafka consumer group. Local fallback active.');
      return null;
    }
  }

  public async disconnectAll(): Promise<void> {
    try {
      if (this.producer) {
        await this.producer.disconnect();
        logger.info('Kafka Producer disconnected.');
      }
      for (const [groupId, consumer] of this.consumers.entries()) {
        await consumer.disconnect();
        logger.info({ groupId }, 'Kafka Consumer disconnected.');
      }
    } catch (err) {
      logger.error({ err }, 'Error closing Kafka connections.');
    }
  }
}

export const kafkaEngine = new KafkaEngine();
