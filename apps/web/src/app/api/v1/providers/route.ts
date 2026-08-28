import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const providers = await prisma.providerConfig.findMany({
      select: { id: true, name: true, providerType: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: providers });
  } catch (error: any) {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, providerType, credentials } = body;

    let org = await prisma.organization.findFirst({ where: { slug: 'default-org' } });
    if (!org) {
      org = await prisma.organization.create({ data: { name: 'Primary Organization', slug: 'default-org' } });
    }

    const provider = await prisma.providerConfig.create({
      data: {
        orgId: org.id,
        name,
        providerType: providerType || 'AWS_SES',
        credentialsEncrypted: JSON.stringify(credentials || {}),
        isActive: true,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
