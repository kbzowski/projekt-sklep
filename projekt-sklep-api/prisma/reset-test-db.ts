/**
 * Skrypt resetujacy baze danych dla testów E2E
 */

import { execSync } from 'child_process';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./test.db',
});

const prisma = new PrismaClient({
  adapter,
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