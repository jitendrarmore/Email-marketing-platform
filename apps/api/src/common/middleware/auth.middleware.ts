import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { jwtVerify } from 'jose';
import { config } from '../../config/index.js';
import { UnauthorizedException } from '../exceptions/http-exceptions.js';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  try {
    const secret = new TextEncoder().encode(config.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    request.user = {
      id: payload.sub as string,
      email: payload.email as string,
      orgId: payload.orgId as string,
      roles: (payload.roles as string[]) || [],
      permissions: (payload.permissions as string[]) || [],
    };
  } catch (err) {
    request.log.warn({ err }, 'Token verification failed');
    throw new UnauthorizedException('Invalid or expired token');
  }
}

const authMiddlewarePlugin: FastifyPluginAsync = async (app) => {
  app.decorate('authenticate', authenticate);
};

export const authMiddleware = fp(authMiddlewarePlugin);

