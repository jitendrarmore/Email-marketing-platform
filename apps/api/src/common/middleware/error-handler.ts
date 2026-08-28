import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AppException } from '../exceptions/app.exception.js';
import { config } from '../../config/index.js';

const errorHandlerPlugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppException) {
      if (!error.isOperational) {
        request.log.error(error);
      } else {
        request.log.info({ err: error }, error.message);
      }

      const response: any = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      };

      if (config.NODE_ENV === 'development') {
        response.error.stack = error.stack;
      }

      return reply.status(error.statusCode).send(response);
    }

    // Default fastify errors or unknown errors
    const errObj = error as any;
    request.log.error(errObj);

    const statusCode = errObj.statusCode || 500;
    const response: any = {
      success: false,
      error: {
        code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN_ERROR',
        message: statusCode === 500 ? 'Internal Server Error' : errObj.message,
      },
    };

    if (config.NODE_ENV === 'development') {
      response.error.stack = errObj.stack;
    }

    return reply.status(statusCode).send(response);
  });
};

export const errorHandler = fp(errorHandlerPlugin);
