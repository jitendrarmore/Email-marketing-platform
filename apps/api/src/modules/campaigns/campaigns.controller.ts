import { FastifyRequest, FastifyReply } from 'fastify';
import { CampaignsService } from './campaigns.service.js';
import { parsePaginationQuery } from '../../common/utils/pagination.js';

export class CampaignsController {
  private service = new CampaignsService();

  async listCampaigns(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const pagination = parsePaginationQuery(req.query);
    const result = await this.service.listCampaigns(user.orgId, user.id, user.roles || [], pagination);
    return reply.send(result);
  }

  async getCampaign(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.getCampaign(user.orgId, id, user.id, user.roles || []);
    return reply.send(result);
  }

  async createCampaign(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const result = await this.service.createCampaign(user.orgId, user.id, req.body as any);
    return reply.send(result);
  }

  async updateCampaign(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.updateCampaign(user.orgId, id, user.id, req.body as any);
    return reply.send(result);
  }

  async deleteCampaign(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.deleteCampaign(user.orgId, id, user.id);
    return reply.send(result);
  }

  async submitCampaign(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.submitCampaign(user.orgId, id, user.id);
    return reply.send(result);
  }

  async pauseCampaign(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.pauseCampaign(user.orgId, id);
    return reply.send(result);
  }

  async resumeCampaign(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.resumeCampaign(user.orgId, id);
    return reply.send(result);
  }

  async cancelCampaign(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.cancelCampaign(user.orgId, id);
    return reply.send(result);
  }

  async getStats(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const result = await this.service.getCampaignStats(user.orgId, id);
    return reply.send(result);
  }

  async getLogs(req: FastifyRequest, reply: FastifyReply) {
    const user = (req as any).user;
    const { id } = req.params as any;
    const pagination = parsePaginationQuery(req.query);
    const result = await this.service.getCampaignLogs(user.orgId, id, pagination);
    return reply.send(result);
  }
}
