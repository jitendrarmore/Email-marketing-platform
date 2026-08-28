import { prisma } from '../../config/database';
import { config } from '../../config';
import { logger } from '../../infrastructure/logging/logger';
import { encrypt, decrypt } from '../../common/utils/crypto';
import { NotFoundException, BadRequestException } from '../../common/exceptions/http-exceptions';
import { EmailProviderFactory } from './adapters/provider.factory';

export class ProvidersService {
  private factory = new EmailProviderFactory();

  async listProviders(orgId: string, pagination: { skip: number; take: number }) {
    const [providers, total] = await Promise.all([
      prisma.providerConfig.findMany({
        where: { orgId },
        select: { id: true, name: true, providerType: true, isActive: true, settings: true, createdAt: true, updatedAt: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.providerConfig.count({ where: { orgId } }),
    ]);
    return { data: providers, total };
  }

  async getProvider(orgId: string, providerId: string) {
    const provider = await prisma.providerConfig.findFirst({
      where: { id: providerId, orgId },
      select: { id: true, orgId: true, name: true, providerType: true, isActive: true, settings: true, createdAt: true, updatedAt: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async createProvider(orgId: string, data: { name: string; providerType: string; credentials: Record<string, string>; settings?: Record<string, unknown> }) {
    const credentialsEncrypted = encrypt(JSON.stringify(data.credentials), config.ENCRYPTION_KEY);
    const provider = await prisma.providerConfig.create({
      data: {
        orgId,
        name: data.name,
        providerType: data.providerType as any,
        credentialsEncrypted,
        settings: (data.settings as any) ?? {},
      },
      select: { id: true, name: true, providerType: true, isActive: true, createdAt: true },
    });
    logger.info({ providerId: provider.id, orgId }, 'Provider created');
    return provider;
  }

  async updateProvider(orgId: string, providerId: string, data: { name?: string; credentials?: Record<string, string>; settings?: Record<string, unknown>; isActive?: boolean }) {
    const existing = await prisma.providerConfig.findFirst({ where: { id: providerId, orgId } });
    if (!existing) throw new NotFoundException('Provider not found');
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.settings) updateData.settings = data.settings;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.credentials) updateData.credentialsEncrypted = encrypt(JSON.stringify(data.credentials), config.ENCRYPTION_KEY);
    return prisma.providerConfig.update({ where: { id: providerId }, data: updateData, select: { id: true, name: true, providerType: true, isActive: true, updatedAt: true } });
  }

  async deleteProvider(orgId: string, providerId: string) {
    const existing = await prisma.providerConfig.findFirst({ where: { id: providerId, orgId } });
    if (!existing) throw new NotFoundException('Provider not found');
    const activeCampaigns = await prisma.campaign.count({ where: { providerConfigId: providerId, status: { in: ['QUEUED', 'SENDING'] } } });
    if (activeCampaigns > 0) throw new BadRequestException('Cannot delete provider with active campaigns');
    await prisma.providerConfig.delete({ where: { id: providerId } });
    return { success: true };
  }

  async testProvider(orgId: string, providerId: string) {
    const provider = await prisma.providerConfig.findFirst({ where: { id: providerId, orgId } });
    if (!provider) throw new NotFoundException('Provider not found');
    const credentials = JSON.parse(decrypt(provider.credentialsEncrypted, config.ENCRYPTION_KEY));
    const adapter = this.factory.create(provider.providerType, credentials);
    const health = await adapter.healthCheck();
    return health;
  }

  async getProviderAdapter(orgId: string, providerId: string) {
    const provider = await prisma.providerConfig.findFirst({ where: { id: providerId, orgId } });
    if (!provider) throw new NotFoundException('Provider not found');
    const credentials = JSON.parse(decrypt(provider.credentialsEncrypted, config.ENCRYPTION_KEY));
    return this.factory.create(provider.providerType, credentials);
  }
}
