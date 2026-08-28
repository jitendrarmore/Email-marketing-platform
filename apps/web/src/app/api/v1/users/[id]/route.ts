import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { roles, firstName, lastName, status } = body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (status) updateData.status = status;

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (roles && roles.length > 0) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      const targetRole = roles[0];
      let role = await prisma.role.findUnique({ where: { name: targetRole } });
      if (!role) {
        role = await prisma.role.create({ data: { name: targetRole } });
      }
      await prisma.userRole.create({
        data: { userId: id, roleId: role.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'UPDATE_FAILED', message: error.message || 'Failed to update user' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'DELETE_FAILED', message: error.message || 'Failed to delete user' } },
      { status: 500 }
    );
  }
}
