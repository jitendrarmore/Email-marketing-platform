export interface EmailMessage {
  from: { email: string; name?: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  headers?: Record<string, string>;
  tags?: Record<string, string>;
  trackingOptions?: { openTracking: boolean; clickTracking: boolean };
  idempotencyKey: string;
}

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  error?: { code: string; message: string; retryable: boolean };
}

export interface ProviderHealthStatus {
  healthy: boolean;
  latencyMs?: number;
  quotaRemaining?: number;
  lastChecked: Date;
}

export interface NormalizedDeliveryEvent {
  providerMessageId: string;
  eventType: string;
  recipient: string;
  reason?: string;
  timestamp: Date;
  rawPayload: unknown;
}

export interface IEmailProvider {
  readonly type: string;
  send(message: EmailMessage): Promise<SendResult>;
  sendBatch?(messages: EmailMessage[]): Promise<SendResult[]>;
  verifySender?(email: string): Promise<{ verified: boolean; status: string }>;
  healthCheck(): Promise<ProviderHealthStatus>;
  parseWebhookEvent?(payload: unknown, headers: Record<string, string>): NormalizedDeliveryEvent[];
  validateWebhookSignature?(payload: unknown, headers: Record<string, string>): boolean;
}
