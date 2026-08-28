import { FastifyInstance } from 'fastify';
import { 
  listUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser,
  grantSenderAccess,
  revokeSenderAccess,
  getUserSenderAccess
} from './users.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requirePermissions } from '../../common/middleware/rbac.middleware';

export default async function usersRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', { preHandler: requirePermissions('USERS_READ') }, listUsers);
  fastify.post('/', { preHandler: requirePermissions('USERS_CREATE') }, createUser);
  fastify.get('/:id', { preHandler: requirePermissions('USERS_READ') }, getUser);
  fastify.patch('/:id', { preHandler: requirePermissions('USERS_UPDATE') }, updateUser);
  fastify.delete('/:id', { preHandler: requirePermissions('USERS_DELETE') }, deleteUser);
  
  fastify.post('/:id/sender-access', { preHandler: requirePermissions('USERS_UPDATE') }, grantSenderAccess);
  fastify.delete('/:id/sender-access/:senderId', { preHandler: requirePermissions('USERS_UPDATE') }, revokeSenderAccess);
  fastify.get('/:id/sender-access', { preHandler: requirePermissions('USERS_READ') }, getUserSenderAccess);
}
