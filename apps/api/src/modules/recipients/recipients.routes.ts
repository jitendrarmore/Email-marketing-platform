import { FastifyInstance } from 'fastify';
import { RecipientsController } from './recipients.controller';

export async function recipientsRoutes(fastify: FastifyInstance) {
  const controller = new RecipientsController();

  fastify.get('/campaigns/:campaignId/recipients', controller.listRecipients.bind(controller));
  fastify.post('/campaigns/:campaignId/recipients', controller.addRecipients.bind(controller));
  fastify.post('/campaigns/:campaignId/recipients/upload', controller.uploadCsv.bind(controller));
  fastify.delete('/campaigns/:campaignId/recipients/:id', controller.deleteRecipient.bind(controller));
}
