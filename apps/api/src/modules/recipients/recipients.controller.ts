import { FastifyRequest, FastifyReply } from 'fastify';
import { RecipientsService } from './recipients.service';

export class RecipientsController {
  private service = new RecipientsService();

  async listRecipients(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { campaignId } = req.params as any;
    const result = await this.service.listRecipients(user.orgId, campaignId, req.query);
    return reply.send(result);
  }

  async addRecipients(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { campaignId } = req.params as any;
    const result = await this.service.addRecipients(user.orgId, campaignId, req.body as any[]);
    return reply.send(result);
  }

  async uploadCsv(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { campaignId } = req.params as any;
    // Assuming file is available in req.body.file due to some multipart plugin
    const result = await this.service.uploadCsv(user.orgId, campaignId, (req.body as any).file);
    return reply.send(result);
  }

  async deleteRecipient(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { campaignId, id } = req.params as any;
    const result = await this.service.deleteRecipient(user.orgId, campaignId, id);
    return reply.send(result);
  }
}
