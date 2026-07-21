import { Server } from 'http';
import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { redis } from './lib/redis.js';

let server: Server;

const bootstrap = async () => {
  try {
    logger.info('Initializing MongoDB connection...');
    await mongoose.connect(env.MONGO_URI);
    logger.info('Successfully connected to MongoDB database.');

    server = app.listen(env.PORT, () => {
      logger.info(`🚀 API Server boot completed. Listening on port ${env.PORT} in [${env.NODE_ENV}] mode.`);
    });
  } catch (error) {
    logger.fatal({ err: error }, 'API Server bootstrapping failed.');
    process.exit(1);
  }
};

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful server shutdown process.`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      
      try {
        await mongoose.connection.close();
        logger.info('MongoDB database connection closed.');

        await redis.quit();
        logger.info('Redis client disconnected.');

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

// Listen for termination signals
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
