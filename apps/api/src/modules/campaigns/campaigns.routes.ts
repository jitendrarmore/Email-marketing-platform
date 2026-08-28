import { FastifyInstance } from 'fastify';
import { CampaignsController } from './campaigns.controller';

export async function campaignsRoutes(fastify: FastifyInstance) {
  const controller = new CampaignsController();

  fastify.get('/', controller.listCampaigns.bind(controller));
  fastify.post('/', controller.createCampaign.bind(controller));
  fastify.get('/:id', controller.getCampaign.bind(controller));
  fastify.patch('/:id', controller.updateCampaign.bind(controller));
  fastify.delete('/:id', controller.deleteCampaign.bind(controller));
  fastify.post('/:id/submit', controller.submitCampaign.bind(controller));
  fastify.post('/:id/pause', controller.pauseCampaign.bind(controller));
  fastify.post('/:id/resume', controller.resumeCampaign.bind(controller));
  fastify.post('/:id/cancel', controller.cancelCampaign.bind(controller));
  fastify.get('/:id/stats', controller.getStats.bind(controller));
  fastify.get('/:id/logs', controller.getLogs.bind(controller));
}
