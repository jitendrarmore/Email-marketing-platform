import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { config } from './config/index.js';
import { logger } from './infrastructure/logging/logger.js';
import { errorHandler } from './common/middleware/error-handler.js';
import { prisma } from './config/database.js';
import { closeQueues } from './infrastructure/queue/queue.manager.js';

// Module route imports
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import { providersRoutes } from './modules/providers/providers.routes.js';
import { sendersRoutes } from './modules/senders/senders.routes.js';
import { campaignsRoutes } from './modules/campaigns/campaigns.routes.js';
import { recipientsRoutes } from './modules/recipients/recipients.routes.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';

/**
 * Register all Fastify plugins (CORS, Helmet, Cookie, Multipart, Error Handler)
 */
async function registerPlugins(app: FastifyInstance) {
  await app.register(cors, {
    origin: [config.WEB_URL, 'http://localhost:3000'],
    credentials: true,
  });
  await app.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
  });
  await app.register(cookie, {
    secret: config.JWT_SECRET,
  });
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max CSV upload
      files: 1,
    },
  });
  app.register(errorHandler);
}

/**
 * Register all API routes with /api/v1 prefix
 */
async function registerRoutes(app: FastifyInstance) {
  // Health check
  app.get('/api/v1/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '0.1.0',
  }));

  // Auth routes (login, register, refresh, logout, me)
  await app.register(authRoutes, { prefix: '/api/v1/auth' });

  // User management (CRUD, role assignment, sender access)
  await app.register(usersRoutes, { prefix: '/api/v1/users' });

  // Email provider configuration (CRUD, test connection)
  await app.register(providersRoutes, { prefix: '/api/v1/providers' });

  // Sender identity management (CRUD, verification, authorized senders)
  await app.register(sendersRoutes, { prefix: '/api/v1/senders' });

  // Campaign management (CRUD, submit, pause, cancel, stats, logs)
  await app.register(campaignsRoutes, { prefix: '/api/v1/campaigns' });

  // Recipient management (CRUD, CSV upload) — nested under campaigns
  await app.register(recipientsRoutes, { prefix: '/api/v1' });

  // Webhook endpoints for email providers (SES, Azure, SendGrid, Mailgun)
  await app.register(webhooksRoutes, { prefix: '/api/v1/webhooks' });

  // Audit log viewing (admin only)
  await app.register(auditRoutes, { prefix: '/api/v1/audit' });
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(app: FastifyInstance) {
  logger.info('Shutting down gracefully...');
  try {
    await app.close();
    await prisma.$disconnect();
    await closeQueues();
    logger.info('All connections closed. Goodbye.');
  } catch (err) {
    logger.error(err, 'Error during shutdown');
  }
  process.exit(0);
}

/**
 * Application entry point
 */
async function start() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      ...(config.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }),
    },
  });

  try {
    await registerPlugins(app);
    await registerRoutes(app);

    // Verify database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Graceful shutdown
    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
      process.on(signal, () => gracefulShutdown(app));
    }

    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(
      `🚀 Email Marketing Platform API running on http://localhost:${config.PORT}`,
    );
    logger.info(`📋 Health check: http://localhost:${config.PORT}/api/v1/health`);
  } catch (err) {
    logger.fatal(err, 'Failed to start server');
    process.exit(1);
  }
}

start();
