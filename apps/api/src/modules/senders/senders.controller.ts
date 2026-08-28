import { FastifyRequest, FastifyReply } from 'fastify';
import { SendersService } from './senders.service';

export class SendersController {
  private service = new SendersService();

  async listSenders(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.listSenders((req as any).user.orgId, req.query);
    return reply.send(result);
  }

  async getAuthorized(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.getAuthorizedSenders((req as any).user.orgId, (req as any).user.id);
    return reply.send(result);
  }

  async getSender(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any;
    const result = await this.service.getSender((req as any).user.orgId, id);
    return reply.send(result);
  }

  async createSender(req: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.createSender((req as any).user.orgId, req.body);
    return reply.send(result);
  }

  async updateSender(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any;
    const result = await this.service.updateSender((req as any).user.orgId, id, req.body);
    return reply.send(result);
  }

  async deleteSender(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any;
    const result = await this.service.deleteSender((req as any).user.orgId, id);
    return reply.send(result);
  }

  async verifySender(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as any;
    const result = await this.service.verifySender((req as any).user.orgId, id);
    return reply.send(result);
  }
}
