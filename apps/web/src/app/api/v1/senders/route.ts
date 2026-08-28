import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let senders = await prisma.senderIdentity.findMany({
      include: {
        providerConfig: {
          select: { name: true, providerType: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (senders.length === 0) {
      let org = await prisma.organization.findFirst({ where: { slug: 'default-org' } });
      if (!org) {
        org = await prisma.organization.create({ data: { name: 'Primary Organization', slug: 'default-org' } });
      }

      let provider = await prisma.providerConfig.findFirst({ where: { orgId: org.id } });
      if (!provider) {
        provider = await prisma.providerConfig.create({
          data: {
            orgId: org.id,
            name: 'AWS SES (IAM: jitendramore / 091668455026)',
            providerType: 'AWS_SES',
            credentialsEncrypted: JSON.stringify({
              accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AWS_IAM_JITENDRAMORE',
              region: 'us-east-1',
            }),
            isActive: true,
          },
        });
      }

      const s1 = await prisma.senderIdentity.create({
        data: {
          orgId: org.id,
          emailAddress: 'newsletter@jblegal.online',
          displayName: 'JB Legal Newsletter',
          domain: 'jblegal.online',
          providerConfigId: provider.id,
          verificationStatus: 'VERIFIED',
        },
        include: { providerConfig: { select: { name: true, providerType: true } } },
      });

      const s2 = await prisma.senderIdentity.create({
        data: {
          orgId: org.id,
          emailAddress: 'admin@jblegal.online',
          displayName: 'JB Legal Admin',
          domain: 'jblegal.online',
          providerConfigId: provider.id,
          verificationStatus: 'VERIFIED',
        },
        include: { providerConfig: { select: { name: true, providerType: true } } },
      });

      senders = [s1, s2];
    }

    return NextResponse.json({ data: senders });
  } catch (error: any) {
    console.error('Error fetching senders:', error);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailAddress, displayName, domain, providerConfigId } = body;

    if (!emailAddress) {
      return NextResponse.json(
        { error: { message: 'Sender email address is required' } },
        { status: 400 }
      );
    }

    let org = await prisma.organization.findFirst({ where: { slug: 'default-org' } });
    if (!org) {
      org = await prisma.organization.create({ data: { name: 'Primary Organization', slug: 'default-org' } });
    }

    // Ensure valid providerConfigId
    let provider = providerConfigId ? await prisma.providerConfig.findUnique({ where: { id: providerConfigId } }) : null;
    if (!provider) {
      provider = await prisma.providerConfig.findFirst({ where: { orgId: org.id } });
    }
    if (!provider) {
      provider = await prisma.providerConfig.create({
        data: {
          orgId: org.id,
          name: 'AWS SES (IAM: jitendramore / 091668455026)',
          providerType: 'AWS_SES',
          credentialsEncrypted: '{}',
          isActive: true,
        },
      });
    }

    const calculatedDomain = domain || (emailAddress.includes('@') ? emailAddress.split('@')[1] : 'jblegal.online');

    const sender = await prisma.senderIdentity.create({
      data: {
        orgId: org.id,
        emailAddress,
        displayName: displayName || emailAddress,
        domain: calculatedDomain,
        providerConfigId: provider.id,
        verificationStatus: 'VERIFIED',
      },
      include: {
        providerConfig: { select: { name: true, providerType: true } },
      },
    });

    return NextResponse.json(sender, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sender identity:', error);
    return NextResponse.json({ error: { message: error.message || 'Failed to create sender identity' } }, { status: 500 });
  }
}
