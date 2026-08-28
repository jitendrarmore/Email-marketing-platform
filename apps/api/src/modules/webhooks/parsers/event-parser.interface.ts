import { NormalizedDeliveryEvent } from '../../providers/adapters/email-provider.interface.js';

export interface IEventParser {
  readonly providerType: string;
  validateSignature(payload: unknown, headers: Record<string, string>): boolean;
  parse(payload: unknown): NormalizedDeliveryEvent[];
}
