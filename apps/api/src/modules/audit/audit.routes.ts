import { FastifyInstance } from 'fastify';
import { AuditController } from './audit.controller';

export async function auditRoutes(fastify: FastifyInstance) {
  const controller = new AuditController();

  fastify.get('/', controller.listAuditLogs.bind(controller));
  fastify.get('/:id', controller.getAuditLog.bind(controller));
}
