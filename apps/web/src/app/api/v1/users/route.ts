import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as argon2 from 'argon2';

/**
 * GET /api/v1/users - List users
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      status: u.status,
      roles: u.userRoles.map((r: any) => r.role.name),
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({ data: formatted });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ data: [] });
  }
}

/**
 * POST /api/v1/users - Create new user with role assignment
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, roles } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Email, password, firstName and lastName are required' } },
        { status: 400 }
      );
    }

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: { code: 'USER_EXISTS', message: 'A user with this email address already exists' } },
        { status: 409 }
      );
    }

    // Ensure default organization exists
    let org = await prisma.organization.findFirst({ where: { slug: 'default-org' } });
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Primary Organization', slug: 'default-org' },
      });
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user in transaction
    const newUser = await prisma.$transaction(async (tx: any) => {
      const u = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          orgId: org.id,
          status: 'ACTIVE',
        },
      });

      // Role assignment
      const targetRoleName = (roles && roles[0]) || 'USER';
      let role = await tx.role.findUnique({ where: { name: targetRoleName } });
      if (!role) {
        role = await tx.role.create({ data: { name: targetRoleName } });
      }

      await tx.userRole.create({
        data: {
          userId: u.id,
          roleId: role.id,
        },
      });

      return u;
    });

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        status: newUser.status,
        roles: roles || ['USER'],
        createdAt: newUser.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: { code: 'USER_CREATE_FAILED', message: error.message || 'Failed to create user' } },
      { status: 500 }
    );
  }
}
