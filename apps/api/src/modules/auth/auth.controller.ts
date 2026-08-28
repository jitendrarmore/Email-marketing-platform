import { FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema } from '@email-platform/shared';
import { authService } from './auth.service.js';

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = loginSchema.parse(request.body);
  const tokens = await authService.login(data);

  reply.setCookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth/refresh'
  });

  return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
};

export const registerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = registerSchema.parse(request.body);
  const tokens = await authService.register(data);

  reply.setCookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth/refresh'
  });

  return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
};

export const refreshHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const refreshToken = request.cookies.refreshToken;
  if (!refreshToken) {
    return reply.status(401).send({ message: 'No refresh token provided' });
  }

  const tokens = await authService.refreshToken(refreshToken);

  reply.setCookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth/refresh'
  });

  return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
};

export const logoutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user?.id;
  const refreshToken = request.cookies.refreshToken;

  if (userId && refreshToken) {
    await authService.logout(userId as string, refreshToken);
  }

  reply.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
  return { success: true };
};

export const getCurrentUser = async (request: FastifyRequest, reply: FastifyReply) => {
  return request.user;
};
