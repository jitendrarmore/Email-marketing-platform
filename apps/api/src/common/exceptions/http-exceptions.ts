import { AppException } from './app.exception.js';

export class BadRequestException extends AppException {
  constructor(message: string = 'Bad Request', details?: unknown) {
    super(400, 'BAD_REQUEST', message, true, details);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(401, 'UNAUTHORIZED', message, true, details);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string = 'Forbidden', details?: unknown) {
    super(403, 'FORBIDDEN', message, true, details);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string = 'Not Found', details?: unknown) {
    super(404, 'NOT_FOUND', message, true, details);
  }
}

export class ConflictException extends AppException {
  constructor(message: string = 'Conflict', details?: unknown) {
    super(409, 'CONFLICT', message, true, details);
  }
}

export class TooManyRequestsException extends AppException {
  constructor(message: string = 'Too Many Requests', details?: unknown) {
    super(429, 'TOO_MANY_REQUESTS', message, true, details);
  }
}

export class InternalServerException extends AppException {
  constructor(message: string = 'Internal Server Error', details?: unknown) {
    super(500, 'INTERNAL_SERVER_ERROR', message, false, details);
  }
}
