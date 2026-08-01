import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let sdk: NodeSDK | null = null;

export const initTracing = (): NodeSDK | null => {
  try {
    const traceExporter = new OTLPTraceExporter({
      url: env.JAEGER_URL,
    });

    sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'medflow-api-realtime',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env.NODE_ENV,
      }),
      traceExporter,
    });

    sdk.start();
    logger.info('OpenTelemetry & Jaeger Distributed Tracing initialized successfully.');
    return sdk;
  } catch (error) {
    logger.warn({ err: error }, 'Failed to initialize OpenTelemetry tracing. Continuing without tracing exporter.');
    return null;
  }
};

export const shutdownTracing = async (): Promise<void> => {
  if (sdk) {
    try {
      await sdk.shutdown();
      logger.info('OpenTelemetry SDK shut down cleanly.');
    } catch (error) {
      logger.error({ err: error }, 'Error shutting down OpenTelemetry SDK.');
    }
  }
};
