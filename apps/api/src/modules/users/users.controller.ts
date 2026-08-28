import { FastifyRequest, FastifyReply } from 'fastify';
import { createUserSchema, updateUserSchema } from '@email-platform/shared';
import { usersService } from './users.service.js';

export const listUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const orgId = request.user?.orgId as string;
  const { page, limit, search } = request.query as any;
  
  const result = await usersService.listUsers(orgId, { page: Number(page) || 1, limit: Number(limit) || 10 }, { search });
  return result;
};

export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const orgId = request.user?.orgId as string;
  const { id } = request.params as { id: string };
  
  const user = await usersService.getUserById(orgId, id);
  return user;
};

export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const orgId = request.user?.orgId as string;
  const createdBy = request.user?.id as string;
  const data = createUserSchema.parse(request.body);
  
  const user = await usersService.createUser(orgId, data as any, createdBy);
  return reply.status(201).send(user);
};

export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const orgId = request.user?.orgId as string;
  const updatedBy = request.user?.id as string;
  const { id } = request.params as { id: string };
  const data = updateUserSchema.parse(request.body);
  
  const user = await usersService.updateUser(orgId, id, data as any, updatedBy);
  return user;
};

export const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const orgId = request.user?.orgId as string;
  const deletedBy = request.user?.id as string;
  const { id } = request.params as { id: string };
  
  await usersService.deleteUser(orgId, id, deletedBy);
  return reply.status(204).send();
};

export const grantSenderAccess = async (request: FastifyRequest, reply: FastifyReply) => {
  const orgId = request.user?.orgId as string;
  const grantedBy = request.user?.id as string;
  const { id } = request.params as { id: string };
  const { senderIdentityId } = request.body as { senderIdentityId: string };
  
  await usersService.grantSenderAccess(orgId, id, senderIdentityId, grantedBy);
  return reply.status(204).send();
};

export const revokeSenderAccess = async (request: FastifyRequest, reply: FastifyReply) => {
  const orgId = request.user?.orgId as string;
  const revokedBy = request.user?.id as string;
  const { id, senderId } = request.params as { id: string; senderId: string };
  
  await usersService.revokeSenderAccess(orgId, id, senderId, revokedBy);
  return reply.status(204).send();
};

export const getUserSenderAccess = async (request: FastifyRequest, reply: FastifyReply) => {
  const orgId = request.user?.orgId as string;
  const { id } = request.params as { id: string };
  
  const access = await usersService.getUserSenderAccess(orgId, id);
  return access;
};
