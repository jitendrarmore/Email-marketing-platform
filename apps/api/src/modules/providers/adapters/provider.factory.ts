import { IEmailProvider } from './email-provider.interface';
import { SESAdapter } from './ses.adapter';
import { AzureAdapter } from './azure.adapter';
import { SMTPAdapter } from './smtp.adapter';

export class EmailProviderFactory {
  create(providerType: string, credentials: Record<string, string>): IEmailProvider {
    switch (providerType) {
      case 'AWS_SES':
        return new SESAdapter(
          credentials.region || 'us-east-1',
          credentials.accessKeyId,
          credentials.secretAccessKey,
        );
      case 'AZURE_COMMUNICATION':
      case 'AZURE_EMAIL':
        return new AzureAdapter(credentials.connectionString);
      case 'SMTP':
      case 'CUSTOM':
        return new SMTPAdapter(
          credentials.host,
          parseInt(credentials.port || '587'),
          credentials.user,
          credentials.pass,
          credentials.secure === 'true',
        );
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }
}
