/**
 * Seed script: Default permissions, roles, and sample organization.
 * Run: npx prisma db seed (PostgreSQL)
 * For MySQL: DATABASE_URL=mysql://... npx prisma generate --schema=prisma/schema.mysql.prisma && npx ts-node prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
let prisma: PrismaClient;

if (connectionString.startsWith('mysql://')) {
  // MySQL: use mariadb adapter (requires: npm install @prisma/adapter-mariadb mariadb)
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
  const mariadb = require('mariadb');
  const url = new URL(connectionString);
  const pool = mariadb.createPool({
    host: url.hostname,
    port: parseInt(url.port || '3306', 10),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });
  prisma = new PrismaClient({ adapter: new PrismaMariaDb(pool) });
} else {
  // PostgreSQL
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString });
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
}

const PERMISSIONS = [
  { name: 'MEMBER:VIEW', resource: 'MEMBER', action: 'VIEW', description: 'View members' },
  { name: 'MEMBER:CREATE', resource: 'MEMBER', action: 'CREATE', description: 'Create members' },
  { name: 'MEMBER:UPDATE', resource: 'MEMBER', action: 'UPDATE', description: 'Update members' },
  { name: 'MEMBER:DELETE', resource: 'MEMBER', action: 'DELETE', description: 'Delete members' },
  { name: 'USER:VIEW', resource: 'USER', action: 'VIEW', description: 'View users' },
  { name: 'USER:CREATE', resource: 'USER', action: 'CREATE', description: 'Create users' },
  { name: 'USER:UPDATE', resource: 'USER', action: 'UPDATE', description: 'Update users' },
  { name: 'USER:DELETE', resource: 'USER', action: 'DELETE', description: 'Delete users' },
  { name: 'ROLE:VIEW', resource: 'ROLE', action: 'VIEW', description: 'View roles' },
  { name: 'ROLE:CREATE', resource: 'ROLE', action: 'CREATE', description: 'Create roles' },
  { name: 'ROLE:UPDATE', resource: 'ROLE', action: 'UPDATE', description: 'Update roles' },
  { name: 'ROLE:DELETE', resource: 'ROLE', action: 'DELETE', description: 'Delete roles' },
  { name: 'PERMISSION:VIEW', resource: 'PERMISSION', action: 'VIEW', description: 'View permissions' },
  { name: 'PERMISSION:CREATE', resource: 'PERMISSION', action: 'CREATE', description: 'Create permissions' },
  { name: 'PERMISSION:UPDATE', resource: 'PERMISSION', action: 'UPDATE', description: 'Update permissions' },
  { name: 'PERMISSION:DELETE', resource: 'PERMISSION', action: 'DELETE', description: 'Delete permissions' },
  { name: 'ORGANIZATION:VIEW', resource: 'ORGANIZATION', action: 'VIEW', description: 'View organization' },
  { name: 'ORGANIZATION:CREATE', resource: 'ORGANIZATION', action: 'CREATE', description: 'Create organization' },
  { name: 'ORGANIZATION:UPDATE', resource: 'ORGANIZATION', action: 'UPDATE', description: 'Update organization' },
  { name: 'ORGANIZATION:DELETE', resource: 'ORGANIZATION', action: 'DELETE', description: 'Delete organization' },
  { name: 'AUDIT:VIEW', resource: 'AUDIT', action: 'VIEW', description: 'View audit logs' },
];

const ROLES = [
  { name: 'PASTOR', description: 'Church pastor' },
  { name: 'CHURCH_ADMIN', description: 'Church administrator' },
  { name: 'DISTRICT_ADMIN', description: 'District administrator' },
  { name: 'CONFERENCE_ADMIN', description: 'Conference administrator' },
];

async function main() {
  console.log('Seeding permissions...');
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: p.name },
      create: p,
      update: p,
    });
  }

  console.log('Seeding roles...');
  const roleIds: Record<string, string> = {};
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      create: r,
      update: r,
    });
    roleIds[r.name] = role.id;
  }

  console.log('Assigning permissions to roles...');
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = Object.fromEntries(allPermissions.map((p) => [p.name, p.id]));

  const rolePermissions: Record<string, string[]> = {
    PASTOR: ['MEMBER:VIEW', 'MEMBER:CREATE', 'MEMBER:UPDATE', 'USER:VIEW'],
    CHURCH_ADMIN: ['MEMBER:VIEW', 'MEMBER:CREATE', 'MEMBER:UPDATE', 'MEMBER:DELETE', 'USER:VIEW', 'USER:CREATE', 'USER:UPDATE'],
    DISTRICT_ADMIN: [...Object.keys(permissionMap).filter((n) => n.startsWith('MEMBER:') || n.startsWith('USER:')), 'ORGANIZATION:VIEW', 'ORGANIZATION:UPDATE'],
    CONFERENCE_ADMIN: Object.keys(permissionMap),
  };

  for (const [roleName, permNames] of Object.entries(rolePermissions)) {
    const roleId = roleIds[roleName];
    if (!roleId) continue;
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    const toCreate = permNames
      .map((permName) => permissionMap[permName])
      .filter(Boolean)
      .map((permissionId) => ({ roleId, permissionId }));
    if (toCreate.length > 0) {
      await prisma.rolePermission.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }
  }

  console.log('Creating sample organization...');
  const conference = await prisma.conference.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    create: { id: '00000000-0000-0000-0000-000000000001', name: 'Sample Conference' },
    update: { name: 'Sample Conference' },
  });

  const district = await prisma.district.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    create: { id: '00000000-0000-0000-0000-000000000002', conferenceId: conference.id, name: 'Sample District' },
    update: { name: 'Sample District' },
  });

  const church = await prisma.church.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    create: { id: '00000000-0000-0000-0000-000000000003', districtId: district.id, name: 'Sample Church' },
    update: { name: 'Sample Church' },
  });

  const pastorRoleId = roleIds['PASTOR'];
  if (pastorRoleId) {
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@samplechurch.org' },
    });
    if (!existing) {
      const passwordHash = await bcrypt.hash('Password123!', 12);
      await prisma.user.create({
        data: {
          fullName: 'Sample Pastor',
          email: 'admin@samplechurch.org',
          passwordHash,
          roleId: pastorRoleId,
          churchId: church.id,
          districtId: district.id,
          conferenceId: conference.id,
        },
      });
      console.log('Created sample user: admin@samplechurch.org / Password123!');
    }
  }

  const conferenceAdminRoleId = roleIds['CONFERENCE_ADMIN'];
  if (conferenceAdminRoleId) {
    const existing = await prisma.user.findUnique({
      where: { email: 'superadmin@samplechurch.org' },
    });
    if (!existing) {
      const passwordHash = await bcrypt.hash('Password123!', 12);
      await prisma.user.create({
        data: {
          fullName: 'Super Admin',
          email: 'superadmin@samplechurch.org',
          passwordHash,
          roleId: conferenceAdminRoleId,
          churchId: church.id,
          districtId: district.id,
          conferenceId: conference.id,
        },
      });
      console.log('Created full admin: superadmin@samplechurch.org / Password123!');
    }
  }

  console.log('Seeding sample members...');
  const sampleMembers = [
    { fullName: 'John Smith', email: 'john.smith@example.com' },
    { fullName: 'Mary Johnson', email: 'mary.johnson@example.com' },
    { fullName: 'David Williams', email: 'david.williams@example.com' },
    { fullName: 'Sarah Brown', email: null },
    { fullName: 'James Davis', email: 'james.davis@example.com' },
  ];
  for (const m of sampleMembers) {
    const existing = await prisma.member.findFirst({
      where: { churchId: church.id, fullName: m.fullName },
    });
    if (!existing) {
      await prisma.member.create({
        data: {
          churchId: church.id,
          fullName: m.fullName,
          email: m.email ?? undefined,
        },
      });
    }
  }
  console.log(`Created ${sampleMembers.length} sample members.`);

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
