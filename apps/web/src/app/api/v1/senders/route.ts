import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const senders = await prisma.senderIdentity.findMany({
      include: {
        providerConfig: {
          select: { name: true, providerType: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
          name: 'Primary AWS SES Provider',
          providerType: 'AWS_SES',
          credentialsEncrypted: '{}',
          isActive: true,
        },
      });
    }

    const calculatedDomain = domain || (emailAddress.includes('@') ? emailAddress.split('@')[1] : 'example.com');

    const sender = await prisma.senderIdentity.create({
      data: {
        orgId: org.id,
        emailAddress,
        displayName: displayName || emailAddress,
        domain: calculatedDomain,
        providerConfigId: provider.id,
        verificationStatus: 'VERIFIED',
      },
    });

    return NextResponse.json(sender, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sender identity:', error);
    return NextResponse.json({ error: { message: error.message || 'Failed to create sender identity' } }, { status: 500 });
  }
}
