import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/index.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  'tenants:manage',
  'users:read',
  'users:manage',
  'roles:read',
  'roles:manage',
];

async function main() {
  for (const action of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    });
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'tenant-demo' },
    update: {},
    create: {
      name: 'Tenant Demo',
      slug: 'tenant-demo',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name_tenantId: { name: 'admin', tenantId: tenant.id } },
    update: {},
    create: {
      name: 'admin',
      tenantId: tenant.id,
    },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('Seed concluído:', { tenant: tenant.slug, role: adminRole.name });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
