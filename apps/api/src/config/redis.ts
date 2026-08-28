import { Redis } from 'ioredis';
import { config } from './index.js';

export function createRedisConnection(purpose: string = 'general') {
  return new Redis(config.REDIS_URL, {
    connectionName: `email-platform-${purpose}`,
    maxRetriesPerRequest: null,
  });
}
