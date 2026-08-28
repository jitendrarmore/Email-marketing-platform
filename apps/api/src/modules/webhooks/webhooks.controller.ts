import { FastifyRequest, FastifyReply } from 'fastify';
import { WebhooksService } from './webhooks.service';

export class WebhooksController {
  private service = new WebhooksService();

  async handleSES(req: FastifyRequest, reply: FastifyReply) {
    const headers = req.headers as Record<string, string>;
    await this.service.processWebhookEvent('SES', req.body, headers);
    return reply.send({ success: true });
  }

  async handleAzure(req: FastifyRequest, reply: FastifyReply) {
    const headers = req.headers as Record<string, string>;
    await this.service.processWebhookEvent('AZURE', req.body, headers);
    return reply.send({ success: true });
  }

  async handleSendGrid(req: FastifyRequest, reply: FastifyReply) {
    const headers = req.headers as Record<string, string>;
    await this.service.processWebhookEvent('SENDGRID', req.body, headers);
    return reply.send({ success: true });
  }

  async handleMailgun(req: FastifyRequest, reply: FastifyReply) {
    const headers = req.headers as Record<string, string>;
    await this.service.processWebhookEvent('MAILGUN', req.body, headers);
    return reply.send({ success: true });
  }
}
