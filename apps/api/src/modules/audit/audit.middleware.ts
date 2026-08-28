import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditService } from './audit.service';

export function auditMiddleware() {
  const auditService = new AuditService();

  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      const user = (req as any).user;
      if (user) {
        await auditService.log({
          orgId: user.orgId,
          userId: user.id,
          action: req.method,
          resourceType: req.url,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }
    }
  };
}
