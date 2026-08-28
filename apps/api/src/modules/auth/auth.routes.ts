import { FastifyInstance } from 'fastify';
import { 
  loginHandler, 
  registerHandler, 
  refreshHandler, 
  logoutHandler,
  getCurrentUser
} from './auth.controller';
import { authenticate } from '../../common/middleware/auth.middleware';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', loginHandler);
  fastify.post('/register', registerHandler);
  fastify.post('/refresh', refreshHandler);
  
  fastify.post('/logout', { preHandler: [authenticate] }, logoutHandler);
  fastify.get('/me', { preHandler: [authenticate] }, getCurrentUser);
}
