import { v4 as uuidv4 } from 'uuid';
import { EventEnvelope, EventTraceContext, KAFKA_TOPICS, RABBITMQ_QUEUES } from '@medicore360/shared';
import { kafkaEngine } from './kafka/kafka.client.js';
import { rabbitMQEngine } from './rabbitmq/rabbitmq.client.js';
import { createCircuitBreaker } from '../lib/circuitBreaker.js';
import { logger } from '../lib/logger.js';

export interface PublishOptions {
  hospitalId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  producer?: string;
  targetBroker?: 'KAFKA' | 'RABBITMQ' | 'BOTH';
}

export class EventBus {
  // Circuit breaker wrapper around Kafka publish
  private static kafkaBreaker = createCircuitBreaker(
    async (topic: string, envelope: EventEnvelope) => {
      await kafkaEngine.publishEvent(topic, envelope);
    },
    { name: 'KafkaPublishBreaker', timeout: 4000, errorThresholdPercentage: 50 }
  );

  // Circuit breaker wrapper around RabbitMQ publish
  private static rabbitBreaker = createCircuitBreaker(
    async (queue: string, envelope: EventEnvelope, priority = 0) => {
      await rabbitMQEngine.publishToQueue(queue, envelope, priority);
    },
    { name: 'RabbitMQPublishBreaker', timeout: 4000, errorThresholdPercentage: 50 }
  );

  public static async publish<T = Record<string, unknown>>(
    eventType: string,
    data: T,
    options: PublishOptions = {}
  ): Promise<EventEnvelope<T>> {
    const hospitalId = options.hospitalId || 'HOSPITAL-GLOBAL';
    const correlationId = options.correlationId || uuidv4();
    const eventId = uuidv4();

    const traceContext: EventTraceContext = {
      correlationId,
      traceId: options.traceId,
      spanId: options.spanId,
    };

    const envelope: EventEnvelope<T> = {
      eventId,
      eventType,
      eventVersion: '1.0',
      timestamp: new Date().toISOString(),
      producer: options.producer || 'medflow-api-service',
      hospitalId,
      traceContext,
      data,
    };

    const targetTopic = this.resolveKafkaTopic(eventType);
    const targetQueue = this.resolveRabbitMQQueue(eventType);
    const targetBroker = options.targetBroker || 'BOTH';

    // 1. Publish to Kafka Engine (if applicable)
    if ((targetBroker === 'KAFKA' || targetBroker === 'BOTH') && targetTopic) {
      try {
        await this.kafkaBreaker.fire(targetTopic, envelope);
      } catch (err) {
        logger.warn({ err, eventId, eventType }, 'EventBus: Kafka publish bypassed by circuit breaker / error.');
      }
    }

    // 2. Publish to RabbitMQ Queue Broker (if applicable)
    if ((targetBroker === 'RABBITMQ' || targetBroker === 'BOTH') && targetQueue) {
      try {
        const priority = eventType.includes('emergency') ? 10 : 0;
        await this.rabbitBreaker.fire(targetQueue, envelope, priority);
      } catch (err) {
        logger.warn({ err, eventId, eventType }, 'EventBus: RabbitMQ publish bypassed by circuit breaker / error.');
      }
    }

    return envelope;
  }

  private static resolveKafkaTopic(eventType: string): string {
    if (eventType.startsWith('patient.')) return KAFKA_TOPICS.PATIENT_EVENTS;
    if (eventType.startsWith('appointment.') || eventType.startsWith('queue.')) return KAFKA_TOPICS.APPOINTMENT_EVENTS;
    if (eventType.startsWith('billing.')) return KAFKA_TOPICS.BILLING_EVENTS;
    if (eventType.startsWith('ambulance.')) return KAFKA_TOPICS.AMBULANCE_EVENTS;
    if (eventType.startsWith('doctor.')) return KAFKA_TOPICS.DOCTOR_EVENTS;
    if (eventType.startsWith('inventory.') || eventType.startsWith('pharmacy.') || eventType.startsWith('blood.')) return KAFKA_TOPICS.INVENTORY_EVENTS;
    if (eventType.startsWith('notification.')) return KAFKA_TOPICS.NOTIFICATION_EVENTS;
    if (eventType.startsWith('lab.')) return KAFKA_TOPICS.LAB_EVENTS;
    return KAFKA_TOPICS.ANALYTICS_EVENTS;
  }

  private static resolveRabbitMQQueue(eventType: string): string | null {
    if (eventType.startsWith('notification.email')) return RABBITMQ_QUEUES.EMAIL_NOTIFICATIONS;
    if (eventType.startsWith('notification.sms')) return RABBITMQ_QUEUES.SMS_NOTIFICATIONS;
    if (eventType.startsWith('notification.push')) return RABBITMQ_QUEUES.PUSH_NOTIFICATIONS;
    if (eventType.startsWith('emergency.')) return RABBITMQ_QUEUES.EMERGENCY_PRIORITY;
    if (eventType.startsWith('billing.')) return RABBITMQ_QUEUES.ACCOUNTING_PROCESS;
    if (eventType.startsWith('audit.')) return RABBITMQ_QUEUES.AUDIT_LOGS;
    return null;
  }
}
