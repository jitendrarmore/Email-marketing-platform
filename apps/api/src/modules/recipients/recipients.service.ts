/**
 * Service for managing recipients.
 */
export class RecipientsService {
  async listRecipients(orgId: string, campaignId: string, pagination: any) {
    return { data: [], total: 0 };
  }

  async addRecipients(orgId: string, campaignId: string, recipients: any[]) {
    return { success: true, count: recipients.length };
  }

  async uploadCsv(orgId: string, campaignId: string, fileBuffer: Buffer) {
    return { success: true, added: 0, errors: [] };
  }

  async deleteRecipient(orgId: string, campaignId: string, recipientId: string) {
    return { success: true };
  }
}
