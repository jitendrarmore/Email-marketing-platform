import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenException } from '../exceptions/http-exceptions.js';

export function requirePermissions(...requiredPermissions: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userPermissions = request.user?.permissions ?? [];
    
    // Check if user has wildcard permission
    if (userPermissions.includes('*:*')) return;
    
    // Check if user has all required permissions
    const hasAll = requiredPermissions.every(p => userPermissions.includes(p));
    
    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions');
    }
  };
}
