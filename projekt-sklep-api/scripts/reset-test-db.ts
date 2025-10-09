/**
 * Reset Test Database Script
 *
 * This script resets the test database to a clean state.
 * Used before running e2e tests to ensure consistent test data.
 */

import { execSync } from 'child_process';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db',
    },
  },
});

async function resetTestDatabase() {
  try {
    console.log('Resetting test database...');

    // Clear all tables
    await prisma.refreshToken.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('✓ Cleared all tables');

    // Run migrations
    console.log('Running migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    });

    console.log('✓ Migrations completed');

    // Seed test data
    console.log('Seeding test data...');
    execSync('npx ts-node prisma/seed-test.ts', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    });

    console.log('✓ Test database reset complete!');
  } catch (error) {
    console.error('Error resetting test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetTestDatabase();