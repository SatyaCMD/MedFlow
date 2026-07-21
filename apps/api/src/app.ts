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

const app = express();

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

// API Endpoints
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/patient', patientRouter);
app.use('/api/v1/appointment', appointmentRouter);
app.use('/api/v1/emr', emrRouter);
app.use('/api/v1/lab', labRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/pharmacy', pharmacyRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/messaging', messagingRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/doctor', doctorRouter);
app.use('/api/v1/demo', demoRouter);

// Metrics Scraping Endpoint
app.get('/metrics', getMetricsHandler);

// Liveness Probe
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

// Readiness Probe
app.get('/ready', async (_req, res) => {
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
});

// Global Error Handler
app.use(errorHandler);

export { app };
