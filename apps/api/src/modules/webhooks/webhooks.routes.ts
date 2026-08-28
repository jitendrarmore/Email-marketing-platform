import { FastifyInstance } from 'fastify';
import { WebhooksController } from './webhooks.controller';

export async function webhooksRoutes(fastify: FastifyInstance) {
  const controller = new WebhooksController();

  fastify.post('/ses', controller.handleSES.bind(controller));
  fastify.post('/azure', controller.handleAzure.bind(controller));
  fastify.post('/sendgrid', controller.handleSendGrid.bind(controller));
  fastify.post('/mailgun', controller.handleMailgun.bind(controller));
}
