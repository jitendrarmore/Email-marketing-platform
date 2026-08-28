import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'System Administrator' },
  });

  const maintainerRole = await prisma.role.upsert({
    where: { name: 'Maintainer' },
    update: {},
    create: { name: 'Maintainer', description: 'System Maintainer' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User', description: 'Standard User' },
  });

  // Create wildcard permission
  const allPermission = await prisma.permission.upsert({
    where: { resource_action: { resource: '*', action: '*' } },
    update: {},
    create: { resource: '*', action: '*', description: 'All access' },
  });

  // Map wildcard to Admin
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: allPermission.id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: allPermission.id },
  });

  // Create Org
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: { name: 'Default Organization', slug: 'default' },
  });

  // Create Admin User
  const passwordHash = await argon2.hash('Admin123!@#');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      orgId: defaultOrg.id,
      status: 'ACTIVE',
    },
  });

  // Map user to Admin role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log('Database seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
