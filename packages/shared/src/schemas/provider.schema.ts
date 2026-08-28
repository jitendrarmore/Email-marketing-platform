import { z } from 'zod';
import { ProviderType } from '../constants/enums.js';

export const createProviderSchema = z.object({
  name: z.string().min(1),
  providerType: z.nativeEnum(ProviderType),
  credentials: z.record(z.string(), z.string()),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const createSenderSchema = z.object({
  emailAddress: z.string().email(),
  displayName: z.string().min(1),
  providerConfigId: z.string().uuid(),
});
