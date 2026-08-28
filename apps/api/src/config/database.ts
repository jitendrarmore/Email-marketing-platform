import { PrismaClient } from '@prisma/client';
import { config } from './index.js';

const logLevels: any[] = config.NODE_ENV === 'development' 
  ? ['query', 'info', 'warn', 'error'] 
  : ['error'];

export const prisma = new PrismaClient({
  log: logLevels,
});
