import { FastifyInstance } from 'fastify';
import { ProvidersController } from './providers.controller';

export async function providersRoutes(fastify: FastifyInstance) {
  const controller = new ProvidersController();

  fastify.get('/', controller.listProviders.bind(controller));
  fastify.post('/', controller.createProvider.bind(controller));
  fastify.get('/:id', controller.getProvider.bind(controller));
  fastify.patch('/:id', controller.updateProvider.bind(controller));
  fastify.delete('/:id', controller.deleteProvider.bind(controller));
  fastify.post('/:id/test', controller.testProvider.bind(controller));
}
