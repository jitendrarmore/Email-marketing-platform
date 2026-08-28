import { FastifyRequest, FastifyReply } from 'fastify';
import { ProvidersService } from './providers.service.js';
import { parsePaginationQuery } from '../../common/utils/pagination.js';

export class ProvidersController {
  private service = new ProvidersService();

  async listProviders(req: FastifyRequest, reply: FastifyReply) {
    const pagination = parsePaginationQuery(req.query);
    const result = await this.service.listProviders((req as any).user.orgId, pagination);
    return reply.send(result);
  }

  async getProvider(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any;
    const result = await this.service.getProvider((req as any).user.orgId, id);
    return reply.send(result);
  }

  async createProvider(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.createProvider((req as any).user.orgId, req.body as any);
    return reply.send(result);
  }

  async updateProvider(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any;
    const result = await this.service.updateProvider((req as any).user.orgId, id, req.body as any);
    return reply.send(result);
  }

  async deleteProvider(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any;
    const result = await this.service.deleteProvider((req as any).user.orgId, id);
    return reply.send(result);
  }

  async testProvider(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any;
    const result = await this.service.testProvider((req as any).user.orgId, id);
    return reply.send(result);
  }
}

