/**
 * Skrypt resetujacy baze danych dla testów E2E
 */

import { execSync } from 'child_process';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db', // Zawsze używaj test.db
    },
  },
});

async function resetTestDatabase() {
  try {
    execSync('npx prisma migrate reset --force', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    });

    execSync('npx ts-node prisma/seed-test.ts', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    });
  } catch (error) {
    console.error('Error resetting test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void resetTestDatabase();