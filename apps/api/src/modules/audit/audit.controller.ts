import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditService } from './audit.service';

export class AuditController {
  private service = new AuditService();

  async listAuditLogs(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const result = await this.service.listAuditLogs(user.orgId, req.query);
    return reply.send(result);
  }

  async getAuditLog(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.getAuditLog(user.orgId, id);
    return reply.send(result);
  }
}
