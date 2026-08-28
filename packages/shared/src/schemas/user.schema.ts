import { z } from 'zod';
import { UserStatus } from '../constants/enums.js';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roles: z.array(z.string()),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  roles: z.array(z.string()).optional(),
});
