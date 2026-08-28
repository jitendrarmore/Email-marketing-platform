import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updated = await prisma.senderIdentity.update({
      where: { id },
      data: { verificationStatus: 'VERIFIED' },
    });
    return NextResponse.json({ success: true, status: 'VERIFIED', data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message || 'Verification check failed' } }, { status: 500 });
  }
}
