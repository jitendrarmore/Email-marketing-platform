import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1),
  senderIdentityId: z.string().uuid(),
  providerConfigId: z.string().uuid(),
  subject: z.string().min(1),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  signature: z.object({ text: z.string(), html: z.string() }).optional(),
  trackingOptions: z.object({ openTracking: z.boolean(), clickTracking: z.boolean() }).optional(),
});
