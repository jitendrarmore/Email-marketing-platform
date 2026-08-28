import { Queue } from 'bullmq';
import { createRedisConnection } from '../../config/redis.js';

const connection = createRedisConnection('queue');

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: 100,
};

export const queues = {
  campaignProcess: new Queue('campaign-process', { connection, defaultJobOptions }),
  emailSend: new Queue('email-send', { connection, defaultJobOptions }),
  csvImport: new Queue('csv-import', { connection, defaultJobOptions }),
  webhookEvents: new Queue('webhook-events', { connection, defaultJobOptions }),
};

export async function closeQueues() {
  await Promise.all(Object.values(queues).map(q => q.close()));
  connection.disconnect();
}
