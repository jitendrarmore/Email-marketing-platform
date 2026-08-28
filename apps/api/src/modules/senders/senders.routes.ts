import { FastifyInstance } from 'fastify';
import { SendersController } from './senders.controller';

export async function sendersRoutes(fastify: FastifyInstance) {
  const controller = new SendersController();

  fastify.get('/', controller.listSenders.bind(controller));
  fastify.post('/', controller.createSender.bind(controller));
  fastify.get('/authorized', controller.getAuthorized.bind(controller));
  fastify.get('/:id', controller.getSender.bind(controller));
  fastify.patch('/:id', controller.updateSender.bind(controller));
  fastify.delete('/:id', controller.deleteSender.bind(controller));
  fastify.post('/:id/verify', controller.verifySender.bind(controller));
}
