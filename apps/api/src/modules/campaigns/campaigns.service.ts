import { prisma } from '../../config/database';
import { logger } from '../../infrastructure/logging/logger';
import { generateIdempotencyKey } from '../../common/utils/crypto';
import { NotFoundException, BadRequestException, ForbiddenException } from '../../common/exceptions/http-exceptions';
import { queues } from '../../infrastructure/queue/queue.manager';

export class CampaignsService {
  /** Validate that user has access to the specified sender */
  private async validateSenderAuthorization(userId: string, senderIdentityId: string): Promise<void> {
    const access = await prisma.userSenderAccess.findFirst({
      where: { userId, senderIdentityId, isActive: true },
    });
    if (!access) {
      throw new ForbiddenException('You are not authorized to send from this sender identity');
    }
  }

  async listCampaigns(orgId: string, userId: string, roles: string[], pagination: { skip: number; take: number }) {
    const isAdmin = roles.includes('ADMIN') || roles.includes('MAINTAINER');
    const where = isAdmin ? { orgId } : { orgId, createdById: userId };
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          senderIdentity: { select: { emailAddress: true, displayName: true } },
          providerConfig: { select: { name: true, providerType: true } },
          stats: true,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campaign.count({ where }),
    ]);
    return {
      data: campaigns.map(c => ({
        id: c.id, name: c.name, subject: c.subject, status: c.status,
        senderEmail: c.senderIdentity.emailAddress,
        providerName: c.providerConfig.name,
        totalRecipients: c.totalRecipients,
        stats: c.stats,
        createdAt: c.createdAt.toISOString(),
        startedAt: c.startedAt?.toISOString(),
        completedAt: c.completedAt?.toISOString(),
      })),
      total,
    };
  }

  async getCampaign(orgId: string, campaignId: string, userId: string, roles: string[]) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, orgId },
      include: {
        senderIdentity: true,
        providerConfig: { select: { id: true, name: true, providerType: true } },
        stats: true,
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    const isAdmin = roles.includes('ADMIN') || roles.includes('MAINTAINER');
    if (!isAdmin && campaign.createdById !== userId) {
      throw new ForbiddenException('You do not have access to this campaign');
    }
    return campaign;
  }

  async createCampaign(orgId: string, userId: string, data: any) {
    // CRITICAL: Validate sender authorization
    await this.validateSenderAuthorization(userId, data.senderIdentityId);

    // Verify sender is VERIFIED
    const sender = await prisma.senderIdentity.findFirst({
      where: { id: data.senderIdentityId, orgId },
    });
    if (!sender) throw new NotFoundException('Sender identity not found');
    if (sender.verificationStatus !== 'VERIFIED') {
      throw new BadRequestException('Sender identity is not verified');
    }

    // Verify provider is active
    const provider = await prisma.providerConfig.findFirst({
      where: { id: data.providerConfigId, orgId, isActive: true },
    });
    if (!provider) throw new NotFoundException('Provider not found or inactive');

    const idempotencyKey = generateIdempotencyKey();

    const campaign = await prisma.campaign.create({
      data: {
        orgId,
        createdById: userId,
        senderIdentityId: data.senderIdentityId,
        providerConfigId: data.providerConfigId,
        name: data.name,
        subject: data.subject,
        bodyHtml: data.bodyHtml,
        bodyText: data.bodyText,
        signature: data.signature,
        trackingOptions: data.trackingOptions ?? { openTracking: true, clickTracking: true },
        idempotencyKey,
        status: 'DRAFT',
      },
    });

    // Create stats record
    await prisma.campaignStats.create({ data: { campaignId: campaign.id } });

    logger.info({ campaignId: campaign.id, userId }, 'Campaign created');
    return campaign;
  }

  async updateCampaign(orgId: string, campaignId: string, userId: string, data: any) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, orgId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'DRAFT') throw new BadRequestException('Can only update campaigns in DRAFT status');
    if (campaign.createdById !== userId) throw new ForbiddenException('Not your campaign');
    return prisma.campaign.update({ where: { id: campaignId }, data });
  }

  async deleteCampaign(orgId: string, campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, orgId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (!['DRAFT', 'CANCELLED'].includes(campaign.status)) throw new BadRequestException('Can only delete DRAFT or CANCELLED campaigns');
    await prisma.campaign.delete({ where: { id: campaignId } });
    return { success: true };
  }

  async submitCampaign(orgId: string, campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, orgId },
      include: { senderIdentity: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'DRAFT') throw new BadRequestException('Campaign must be in DRAFT status to submit');
    if (campaign.totalRecipients === 0) throw new BadRequestException('Campaign has no recipients');

    // CRITICAL: Re-validate sender authorization at submission time
    await this.validateSenderAuthorization(userId, campaign.senderIdentityId);

    // Update status to QUEUED
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'QUEUED' },
    });

    // Add to processing queue
    await queues.campaignProcess.add('process-campaign', {
      campaignId,
      orgId,
    }, {
      jobId: `campaign-${campaignId}`,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId,
        userId,
        action: 'CAMPAIGN_SUBMITTED',
        resourceType: 'Campaign',
        resourceId: campaignId,
      },
    });

    logger.info({ campaignId, userId }, 'Campaign submitted for processing');
    return { success: true, status: 'QUEUED' };
  }

  async pauseCampaign(orgId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, orgId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'SENDING') throw new BadRequestException('Can only pause SENDING campaigns');
    return prisma.campaign.update({ where: { id: campaignId }, data: { status: 'PAUSED' } });
  }

  async resumeCampaign(orgId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, orgId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'PAUSED') throw new BadRequestException('Can only resume PAUSED campaigns');
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'QUEUED' } });
    await queues.campaignProcess.add('resume-campaign', { campaignId, orgId });
    return { status: 'QUEUED' };
  }

  async cancelCampaign(orgId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, orgId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (!['QUEUED', 'SENDING', 'PAUSED'].includes(campaign.status)) throw new BadRequestException('Cannot cancel campaign in current status');
    return prisma.campaign.update({ where: { id: campaignId }, data: { status: 'CANCELLED', completedAt: new Date() } });
  }

  async getCampaignStats(orgId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, orgId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return prisma.campaignStats.findUnique({ where: { campaignId } });
  }

  async getCampaignLogs(orgId: string, campaignId: string, pagination: { skip: number; take: number }) {
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, orgId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where: { campaignId },
        include: { recipient: { select: { email: true, name: true } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emailLog.count({ where: { campaignId } }),
    ]);
    return { data: logs, total };
  }
}
