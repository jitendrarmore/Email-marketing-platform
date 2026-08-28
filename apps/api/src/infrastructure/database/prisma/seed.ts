import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding system roles, permissions, default organization and initial Admin account...');

  // 1. Create System Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'System Administrator with full permissions' },
  });

  const maintainerRole = await prisma.role.upsert({
    where: { name: 'MAINTAINER' },
    update: {},
    create: { name: 'MAINTAINER', description: 'System Maintainer' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: 'Standard User' },
  });

  // 2. Create Wildcard Permission
  const allPermission = await prisma.permission.upsert({
    where: { resource_action: { resource: '*', action: '*' } },
    update: {},
    create: { resource: '*', action: '*', description: 'Wildcard full system permission' },
  });

  // 3. Assign Wildcard Permission to ADMIN Role
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: allPermission.id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: allPermission.id },
  });

  // 4. Create Default Organization
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: 'default-org' },
    update: {},
    create: { name: 'Primary Organization', slug: 'default-org' },
  });

  // 5. Create Initial Admin Account
  const passwordHash = await argon2.hash('Admin123!@#');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@platform.internal' },
    update: {
      passwordHash,
      orgId: defaultOrg.id,
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@platform.internal',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      orgId: defaultOrg.id,
      status: 'ACTIVE',
    },
  });

  // 6. Assign ADMIN role to adminUser
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log('✅ Initial Admin Account created:');
  console.log('   Email: admin@platform.internal');
  console.log('   Password: Admin123!@#');
  console.log('   Role: ADMIN');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
