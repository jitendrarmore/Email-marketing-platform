import { SESv2Client, SendEmailCommand, GetAccountCommand } from '@aws-sdk/client-sesv2';
import { IEmailProvider, EmailMessage, SendResult, ProviderHealthStatus, NormalizedDeliveryEvent } from './email-provider.interface';
import { logger } from '../../../infrastructure/logging/logger';

export class SESAdapter implements IEmailProvider {
  readonly type = 'AWS_SES';
  private client: SESv2Client;

  constructor(region: string, accessKeyId: string, secretAccessKey: string) {
    this.client = new SESv2Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const command = new SendEmailCommand({
        FromEmailAddress: message.from.name
          ? `${message.from.name} <${message.from.email}>`
          : message.from.email,
        Destination: {
          ToAddresses: message.to.map(r => r.email),
        },
        Content: {
          Simple: {
            Subject: { Data: message.subject, Charset: 'UTF-8' },
            Body: {
              ...(message.htmlBody && { Html: { Data: message.htmlBody, Charset: 'UTF-8' } }),
              ...(message.textBody && { Text: { Data: message.textBody, Charset: 'UTF-8' } }),
            },
          },
        },
        EmailTags: message.tags
          ? Object.entries(message.tags).map(([Name, Value]) => ({ Name, Value }))
          : undefined,
        ConfigurationSetName: undefined,
      });

      const response = await this.client.send(command);
      return {
        success: true,
        providerMessageId: response.MessageId,
      };
    } catch (error: any) {
      logger.error({ error: error.message, idempotencyKey: message.idempotencyKey }, 'SES send failed');
      return {
        success: false,
        error: {
          code: error.name || 'SES_ERROR',
          message: error.message,
          retryable: error.name === 'ThrottlingException' || error.name === 'TooManyRequestsException',
        },
      };
    }
  }

  async healthCheck(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      const command = new GetAccountCommand({});
      const response = await this.client.send(command);
      return {
        healthy: !response.SendingEnabled ? false : true,
        latencyMs: Date.now() - start,
        quotaRemaining: response.SendQuota?.Max24HourSend
          ? response.SendQuota.Max24HourSend - (response.SendQuota.SentLast24Hours ?? 0)
          : undefined,
        lastChecked: new Date(),
      };
    } catch (error: any) {
      return { healthy: false, latencyMs: Date.now() - start, lastChecked: new Date() };
    }
  }

  parseWebhookEvent(payload: any, headers: Record<string, string>): NormalizedDeliveryEvent[] {
    // Parse SNS notification for SES events
    const message = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const eventType = message.eventType || message.notificationType;
    const mail = message.mail || {};

    const typeMap: Record<string, string> = {
      Delivery: 'DELIVERED',
      Bounce: message.bounce?.bounceType === 'Permanent' ? 'BOUNCE_HARD' : 'BOUNCE_SOFT',
      Complaint: 'COMPLAINT',
      Open: 'OPEN',
      Click: 'CLICK',
    };

    const recipients = mail.destination || [];
    return recipients.map((recipient: string) => ({
      providerMessageId: mail.messageId || '',
      eventType: typeMap[eventType] || eventType,
      recipient,
      reason: message.bounce?.bouncedRecipients?.[0]?.diagnosticCode,
      timestamp: new Date(mail.timestamp || Date.now()),
      rawPayload: payload,
    }));
  }

  validateWebhookSignature(payload: unknown, headers: Record<string, string>): boolean {
    // TODO: Implement SNS signature validation
    // In production, verify the SNS message signature using the signing certificate
    return true;
  }
}
