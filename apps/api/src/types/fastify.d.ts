import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      orgId: string;
      roles: string[];
      permissions: string[];
    };
  }
}
