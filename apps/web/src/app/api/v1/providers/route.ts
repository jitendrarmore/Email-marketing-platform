import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    let providers = await prisma.providerConfig.findMany({
      select: { id: true, name: true, providerType: true, isActive: true, createdAt: true, credentialsEncrypted: true },
      orderBy: { createdAt: 'desc' },
    });

    if (providers.length === 0) {
      let org = await prisma.organization.findFirst({ where: { slug: 'default-org' } });
      if (!org) {
        org = await prisma.organization.create({ data: { name: 'Primary Organization', slug: 'default-org' } });
      }

      const defaultAwsProvider = await prisma.providerConfig.create({
        data: {
          orgId: org.id,
          name: 'AWS SES (IAM User: jitendramore)',
          providerType: 'AWS_SES',
          credentialsEncrypted: JSON.stringify({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AWS_IAM_JITENDRAMORE',
            region: 'us-east-1',
            account: '091668455026',
            user: 'jitendramore',
          }),
          isActive: true,
        },
        select: { id: true, name: true, providerType: true, isActive: true, createdAt: true, credentialsEncrypted: true },
      });

      providers = [defaultAwsProvider];
    }

    return NextResponse.json({ data: providers });
  } catch (error: any) {
    console.error('Error fetching providers:', error);
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
        name: name || 'AWS SES Production',
        providerType: providerType || 'AWS_SES',
        credentialsEncrypted: JSON.stringify(credentials || {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AWS_IAM_JITENDRAMORE',
          region: 'us-east-1',
        }),
        isActive: true,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
