import { IEventParser } from './event-parser.interface';
import { NormalizedDeliveryEvent } from '../../providers/adapters/email-provider.interface';

export class AzureEventParser implements IEventParser {
  readonly providerType = 'AZURE';

  validateSignature(payload: unknown, headers: Record<string, string>): boolean {
    return true; // Simplified for mockup
  }

  parse(payload: unknown): NormalizedDeliveryEvent[] {
    return []; // Simplified for mockup
  }
}
