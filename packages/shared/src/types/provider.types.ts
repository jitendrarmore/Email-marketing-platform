export interface CreateProviderRequest { name: string; providerType: string; credentials: Record<string, string>; settings?: Record<string, unknown>; }
export interface ProviderResponse { id: string; name: string; providerType: string; isActive: boolean; createdAt: string; }
export interface SenderIdentityResponse { id: string; emailAddress: string; displayName: string; domain: string; verificationStatus: string; providerConfigId: string; providerName: string; createdAt: string; }
export interface CreateSenderRequest { emailAddress: string; displayName: string; providerConfigId: string; }
