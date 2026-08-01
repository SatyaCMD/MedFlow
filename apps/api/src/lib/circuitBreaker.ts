import CircuitBreaker from 'opossum';
import { logger } from './logger.js';

export interface CircuitBreakerOptions {
  timeout?: number; // Time in ms before request times out (default 5000ms)
  errorThresholdPercentage?: number; // % of errors before opening breaker (default 50%)
  resetTimeout?: number; // Time in ms to wait before trying half-open state (default 10000ms)
  name: string;
}

export const createCircuitBreaker = <T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: CircuitBreakerOptions
): CircuitBreaker => {
  const breaker = new CircuitBreaker(asyncFn, {
    timeout: options.timeout ?? 5000,
    errorThresholdPercentage: options.errorThresholdPercentage ?? 50,
    resetTimeout: options.resetTimeout ?? 10000,
    name: options.name,
  });

  breaker.on('open', () => {
    logger.warn(`⚠️ Circuit Breaker [${options.name}] OPENED. Target service unavailable. Routing to fallbacks.`);
  });

  breaker.on('halfOpen', () => {
    logger.info(`🔄 Circuit Breaker [${options.name}] HALF-OPEN. Testing target service recovery.`);
  });

  breaker.on('close', () => {
    logger.info(`✅ Circuit Breaker [${options.name}] CLOSED. Target service fully healthy.`);
  });

  breaker.on('fallback', () => {
    logger.info(`🛡️ Circuit Breaker [${options.name}] executed fallback handler.`);
  });

  breaker.on('failure', (err: any) => {
    logger.error({ err }, `❌ Circuit Breaker [${options.name}] action failed.`);
  });

  return breaker;
};
