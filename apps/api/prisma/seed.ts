import 'dotenv/config';
import { PlatformRole, PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

interface SeedProfile {
  role: Role;
  email: string;
  password: string;
}

const profiles: SeedProfile[] = [
  {
    role: Role.USER,
    email: process.env.SEED_USER_EMAIL ?? 'dev@example.com',
    password: process.env.SEED_USER_PASSWORD ?? 'changeme123',
  },
  {
    role: Role.ADMIN,
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'changeme123',
  },
  {
    role: Role.OWNER,
    email: process.env.SEED_OWNER_EMAIL ?? 'owner@example.com',
    password: process.env.SEED_OWNER_PASSWORD ?? 'changeme123',
  },
];

async function main() {
  // Upserting by slug converges on the same "default" tenant the
  // membership-role-authority migration already created for pre-existing
  // users — role now lives on Membership, not User.
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: { name: 'Default', slug: 'default' },
  });

  for (const profile of profiles) {
    const passwordHash = await argon2.hash(profile.password);

    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {},
      create: {
        email: profile.email,
        passwordHash,
      },
    });

    await prisma.membership.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
      update: { role: profile.role, status: 'ACTIVE' },
      create: {
        userId: user.id,
        tenantId: tenant.id,
        role: profile.role,
        status: 'ACTIVE',
      },
    });

    console.log(
      `Seeded ${profile.role} user: ${user.email} (tenant: ${tenant.slug})`,
    );
  }

  // Platform Scope bootstrap — deliberately outside the Tenant/Membership
  // loop above: PLATFORM_ADMIN grants Platform Scope authority directly on
  // the identity via the PlatformAdmin table, with zero Membership
  // required (see modules/platform). `changeme123` is a
  // bootstrap/development credential only — it MUST be rotated (or
  // SEED_PLATFORM_ADMIN_PASSWORD overridden) before this seed is ever run
  // against a real/production environment. Never logged, only the email is.
  const platformAdminEmail =
    process.env.SEED_PLATFORM_ADMIN_EMAIL ?? 'platform@seed.admin';
  const platformAdminPassword =
    process.env.SEED_PLATFORM_ADMIN_PASSWORD ?? 'changeme123';
  const platformAdminPasswordHash = await argon2.hash(platformAdminPassword);

  const platformAdminUser = await prisma.user.upsert({
    where: { email: platformAdminEmail },
    update: {},
    create: {
      email: platformAdminEmail,
      passwordHash: platformAdminPasswordHash,
    },
  });

  await prisma.platformAdmin.upsert({
    where: { userId: platformAdminUser.id },
    update: { role: PlatformRole.PLATFORM_ADMIN },
    create: {
      userId: platformAdminUser.id,
      role: PlatformRole.PLATFORM_ADMIN,
    },
  });

  console.log(`Seeded PLATFORM_ADMIN user: ${platformAdminUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
