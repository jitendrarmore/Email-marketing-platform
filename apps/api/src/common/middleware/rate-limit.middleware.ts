import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createRedisConnection } from '../../config/redis.js';
import { config } from '../../config/index.js';

const redisClient = createRedisConnection('rate-limit');

export const generalLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate-limit-general',
  points: config.RATE_LIMIT_MAX,
  duration: config.RATE_LIMIT_WINDOW_MS / 1000,
});

export const authLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate-limit-auth',
  points: 5,
  duration: 15 * 60, // 15 minutes
});

export const webhookLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate-limit-webhook',
  points: 10000,
  duration: 60, // 1 minute
});
