import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Enable default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register: client.register });

// Custom request counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status'],
});

// Custom response latency histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Latency of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.originalUrl;
    const status = res.statusCode.toString();

    httpRequestsTotal.inc({ method: req.method, route, status });
    httpRequestDurationSeconds.observe({ method: req.method, route, status }, duration);
  });

  next();
};

export const getMetricsHandler = async (_req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};
