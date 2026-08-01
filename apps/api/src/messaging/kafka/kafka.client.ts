import { Kafka, Producer, Consumer, KafkaConfig, Partitioners } from 'kafkajs';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { KAFKA_TOPICS, EventEnvelope } from '@medicore360/shared';

class KafkaEngine {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private isConnected = false;

  constructor() {
    const brokers = env.KAFKA_BROKERS.split(',').map((b) => b.trim());
    const config: KafkaConfig = {
      clientId: 'medflow-hospital-platform',
      brokers,
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
    };

    this.kafka = new Kafka(config);
  }

  public async connectProducer(): Promise<Producer> {
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
      logger.warn({ err }, 'Failed to connect Kafka Producer. Will rely on RabbitMQ or outbox queue retry.');
      throw err;
    }
  }

  private async ensureTopicsExist(): Promise<void> {
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
    try {
      const prod = await this.connectProducer();
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
      throw err;
    }
  }

  public async createConsumer(groupId: string, topics: string[], onMessage: (topic: string, envelope: EventEnvelope) => Promise<void>): Promise<Consumer> {
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
      logger.error({ err, groupId, topics }, 'Failed to initialize Kafka consumer group.');
      throw err;
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
