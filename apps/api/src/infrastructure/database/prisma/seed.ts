import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding system roles and permissions...');

  // Create System Roles
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

  // Create Wildcard Permission
  const allPermission = await prisma.permission.upsert({
    where: { resource_action: { resource: '*', action: '*' } },
    update: {},
    create: { resource: '*', action: '*', description: 'Wildcard full system permission' },
  });

  // Assign Wildcard Permission to ADMIN Role
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: allPermission.id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: allPermission.id },
  });

  console.log('System roles and permissions initialized successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
