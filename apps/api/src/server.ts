import { createServer, Server } from 'http';
import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { redis } from './lib/redis.js';
import { initTracing, shutdownTracing } from './lib/tracing.js';
import { socketServer } from './realtime/socketServer.js';
import { kafkaEngine } from './messaging/kafka/kafka.client.js';
import { rabbitMQEngine } from './messaging/rabbitmq/rabbitmq.client.js';
import { outboxWorker } from './messaging/outbox/outboxWorker.js';
import { realtimeEventBridge } from './messaging/kafka/consumers/eventBridge.consumer.js';

let server: Server;

const bootstrap = async () => {
  try {
    // 1. OpenTelemetry Distributed Tracing Init
    initTracing();

    // 2. MongoDB Connection
    logger.info('Initializing MongoDB connection...');
    await mongoose.connect(env.MONGO_URI);
    logger.info('Successfully connected to MongoDB database.');

    // 3. HTTP & Socket.IO Gateway Setup
    server = createServer(app);
    socketServer.init(server);

    // 4. Initialize Messaging Infrastructure (Non-blocking resilience)
    try {
      await kafkaEngine.connectProducer();
      await rabbitMQEngine.getChannel();
    } catch (msgErr) {
      logger.info('Messaging infrastructure initialization deferred to outbox worker fallback.');
    }

    // 5. Start Background Outbox Worker & Realtime Event Bridge
    outboxWorker.start();
    realtimeEventBridge.start().catch((err) => {
      logger.warn({ err }, 'Realtime Event Bridge start deferred.');
    });

    server.listen(env.PORT, () => {
      logger.info(`🚀 MedFlow Enterprise Real-Time API Gateway listening on port ${env.PORT} in [${env.NODE_ENV}] mode.`);
    });
  } catch (error) {
    logger.fatal({ err: error }, 'API Server bootstrapping failed.');
    process.exit(1);
  }
};

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful server shutdown process.`);

  outboxWorker.stop();

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');

      try {
        await kafkaEngine.disconnectAll();
        await rabbitMQEngine.close();
        await mongoose.connection.close();
        logger.info('MongoDB database connection closed.');

        await redis.quit();
        logger.info('Redis client disconnected.');

        await shutdownTracing();

        logger.info('Graceful shutdown completed successfully. Exiting.');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error occurred during connection terminations.');
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, 'Unhandled Rejection detected.');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught Exception detected. System halting.');
  process.exit(1);
});

bootstrap();
