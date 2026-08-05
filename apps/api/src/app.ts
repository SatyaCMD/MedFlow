import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { redis } from './lib/redis.js';
import cookieParser from 'cookie-parser';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { metricsMiddleware, getMetricsHandler } from './middleware/metrics.js';
import authRouter from './modules/auth/auth.routes.js';
import demoRouter from './modules/demo/demo.routes.js';
import patientRouter from './modules/patient/patient.routes.js';
import appointmentRouter from './modules/appointment/appointment.routes.js';
import emrRouter from './modules/emr/emr.routes.js';
import labRouter from './modules/lab/lab.routes.js';
import billingRouter from './modules/billing/billing.routes.js';
import pharmacyRouter from './modules/pharmacy/pharmacy.routes.js';
import inventoryRouter from './modules/inventory/inventory.routes.js';
import messagingRouter from './modules/messaging/messaging.routes.js';
import notificationRouter from './modules/notification/notification.routes.js';
import staffRouter from './modules/staff/staff.routes.js';
import doctorRouter from './modules/doctor/doctor.routes.js';
import bloodBankRouter from './modules/bloodBank/bloodBank.routes.js';
import ambulanceRouter from './modules/ambulance/ambulance.routes.js';
import kycRouter from './modules/kyc/kyc.routes.js';
import aiRouter from './modules/ai/ai.routes.js';
import auditRouter from './modules/audit/audit.routes.js';
import { rateLimit } from './middleware/rateLimit.js';
import { apiGatewayMiddleware } from './gateway/gatewayRouter.js';

const app = express();

// Enterprise API Gateway Pipeline
app.use(apiGatewayMiddleware as any);

// Global API rate limiter (prevents server & database overload from request flooding)
const globalApiRateLimiter = rateLimit({
  windowSeconds: 1, // Every 1 second
  maxRequests: 50, // Max 50 requests per second per IP
  keyPrefix: 'global-sec-limit',
  skipDev: true,
});

// Enable Observability Metrics
app.use(metricsMiddleware);

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? false : true, // Adjust in production
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(cookieParser());
app.use(express.json());

// Correlation ID Middleware
app.use(requestIdMiddleware);

// Apply Global Rate Limiting across all API routes
app.use('/api/v1', globalApiRateLimiter);

// API Endpoints
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/patient', patientRouter);
app.use('/api/v1/appointment', appointmentRouter);
app.use('/api/v1/emr', emrRouter);
app.use('/api/v1/lab', labRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/pharmacy', pharmacyRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/blood-bank', bloodBankRouter);
app.use('/api/v1/ambulance', ambulanceRouter);
app.use('/api/v1/messaging', messagingRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/doctor', doctorRouter);
app.use('/api/v1/kyc', kycRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/demo', demoRouter);

// Metrics Scraping Endpoint
app.get('/metrics', getMetricsHandler);
app.get('/api/v1/metrics', getMetricsHandler);

// Liveness Probe
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
};

app.get('/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Readiness Probe
const readyHandler = async (_req: express.Request, res: express.Response) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isRedisConnected = redis.status === 'ready';

  const status = {
    mongodb: isMongoConnected ? 'up' : 'down',
    redis: isRedisConnected ? 'up' : 'down',
  };

  const isSystemReady = isMongoConnected && isRedisConnected;

  if (!isSystemReady) {
    logger.warn({ status }, 'Readiness probe failed.');
    return res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'One or more backing services are currently offline.',
        details: status,
      },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      status: 'ready',
      services: status,
      timestamp: new Date().toISOString(),
    },
  });
};

app.get('/ready', readyHandler);
app.get('/api/v1/ready', readyHandler);

// 404 Catch-All Handler (Ensures all unmapped routes return structured JSON instead of default HTML)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Global Error Handler
app.use(errorHandler);

export { app };
