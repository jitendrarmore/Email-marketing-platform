import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        senderIdentity: { select: { emailAddress: true } },
        providerConfig: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = campaigns.map((c: any) => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      senderEmail: c.senderIdentity?.emailAddress || 'newsletter@example.com',
      providerName: c.providerConfig?.name || 'AWS SES',
      totalRecipients: c.totalRecipients,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ data: formatted });
  } catch (error: any) {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, subject, senderIdentityId, providerConfigId, bodyHtml, bodyText } = body;

    let org = await prisma.organization.findFirst({ where: { slug: 'default-org' } });
    if (!org) {
      org = await prisma.organization.create({ data: { name: 'Primary Organization', slug: 'default-org' } });
    }

    let user = await prisma.user.findFirst({ where: { deletedAt: null } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@platform.internal',
          passwordHash: 'dummy',
          firstName: 'System',
          lastName: 'Admin',
          orgId: org.id,
        },
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        orgId: org.id,
        createdById: user.id,
        senderIdentityId: senderIdentityId || 'default-sender',
        providerConfigId: providerConfigId || 'default-provider',
        name,
        subject,
        bodyHtml,
        bodyText,
        idempotencyKey: uuidv4(),
        status: 'QUEUED',
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
