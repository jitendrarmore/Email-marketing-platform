export interface AuditEntry {
  orgId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  async log(entry: AuditEntry): Promise<void> {
    // Fire-and-forget log entry
  }

  async listAuditLogs(orgId: string, pagination: any, filters?: any) {
    return { data: [], total: 0 };
  }

  async getAuditLog(orgId: string, logId: string) {
    return { id: logId };
  }
}
