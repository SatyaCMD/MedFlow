import cluster from 'node:cluster';
import os from 'node:os';
import { logger } from './lib/logger.js';

const numCPUs = Math.max(2, os.cpus().length);

if (cluster.isPrimary) {
  logger.info(`🔥 Primary Process ${process.pid} is running. Spawning ${numCPUs} Worker Threads for High-Throughput Load Balancing...`);

  // Fork workers across all CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker Process ${worker.process.pid} died (code: ${code}, signal: ${signal}). Spawning replacement worker...`);
    cluster.fork();
  });
} else {
  // Worker process imports server and listens on HTTP port
  import('./server.js');
}
