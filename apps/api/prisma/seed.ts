import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
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
    role: Role.SUPER_ADMIN,
    email: process.env.SEED_SUPER_ADMIN_EMAIL ?? 'superadmin@example.com',
    password: process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'changeme123',
  },
];

async function main() {
  for (const profile of profiles) {
    const passwordHash = await argon2.hash(profile.password);

    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { role: profile.role },
      create: {
        email: profile.email,
        passwordHash,
        role: profile.role,
      },
    });

    console.log(`Seeded ${user.role} user: ${user.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
