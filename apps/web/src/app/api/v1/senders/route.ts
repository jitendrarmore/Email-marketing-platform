import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const senders = await prisma.senderIdentity.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: senders });
  } catch (error: any) {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailAddress, displayName, domain, providerConfigId } = body;

    let org = await prisma.organization.findFirst({ where: { slug: 'default-org' } });
    if (!org) {
      org = await prisma.organization.create({ data: { name: 'Primary Organization', slug: 'default-org' } });
    }

    const sender = await prisma.senderIdentity.create({
      data: {
        orgId: org.id,
        emailAddress,
        displayName,
        domain: domain || emailAddress.split('@')[1] || 'example.com',
        providerConfigId: providerConfigId || 'default-provider',
        verificationStatus: 'VERIFIED',
      },
    });

    return NextResponse.json(sender, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
