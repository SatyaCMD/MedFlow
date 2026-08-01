import { FEATURE_FLAGS } from '@medicore360/shared';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';

export class FeatureFlagEngine {
  private static defaults: Record<string, boolean> = {
    [FEATURE_FLAGS.ENABLE_LIVE_CHAT]: true,
    [FEATURE_FLAGS.ENABLE_AMBULANCE_TRACKING]: true,
    [FEATURE_FLAGS.ENABLE_EMERGENCY_PANIC]: true,
    [FEATURE_FLAGS.ENABLE_KAFKA_STREAMING]: true,
    [FEATURE_FLAGS.ENABLE_REALTIME_METRICS]: true,
  };

  public static async isEnabled(flagName: string, hospitalId?: string): Promise<boolean> {
    try {
      // 1. Check Redis dynamic toggle override
      const redisKey = hospitalId ? `ff:${hospitalId}:${flagName}` : `ff:global:${flagName}`;
      const override = await redis.get(redisKey);
      if (override !== null) {
        return override === 'true' || override === '1';
      }

      // 2. Check environment variable override
      const envVal = process.env[flagName];
      if (envVal !== undefined) {
        return envVal === 'true' || envVal === '1';
      }

      // 3. Fallback to default configuration
      return this.defaults[flagName] ?? true;
    } catch (err) {
      logger.warn({ err, flagName }, 'FeatureFlagEngine check failed; using default state');
      return this.defaults[flagName] ?? true;
    }
  }

  public static async setFlag(flagName: string, enabled: boolean, hospitalId?: string): Promise<void> {
    const redisKey = hospitalId ? `ff:${hospitalId}:${flagName}` : `ff:global:${flagName}`;
    await redis.set(redisKey, enabled ? 'true' : 'false');
    logger.info({ flagName, enabled, hospitalId }, 'Feature flag state updated in Redis cache');
  }
}
