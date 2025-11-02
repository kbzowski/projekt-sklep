import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

/**
 * Test Database Seed Script
 *
 * Tworzy minimalne dane testowe dla testów e2e.
 * WAŻNE: dane muszą być zgodne z helpers/test-data.ts w projekt-sklep-e2e
 */

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./test.db',
    },
  },
});

async function main() {
  // Wyczyść bazę danych
  await prisma.refreshToken.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Utwórz kategorię
  await Promise.all([
    prisma.category.create({
      data: { id: 1, name: 'Elektronika', slug: 'elektronika' },
    }),
    prisma.category.create({
      data: { id: 2, name: 'Odzież', slug: 'odziez' },
    }),
  ]);

  // Utwórz produkty testowe
  await Promise.all([
    prisma.product.create({
      data: {
        id: 1,
        name: 'Laptop Test',
        price: 4999.99,
        description: 'Test laptop',
        image: '/placeholder.svg',
        categoryId: 1,
      },
    }),
    prisma.product.create({
      data: {
        id: 2,
        name: 'Smartphone Test',
        price: 2499.99,
        description: 'Test smartphone',
        image: '/placeholder.svg',
        categoryId: 1,
      },
    }),
    prisma.product.create({
      data: {
        id: 3,
        name: 'Koszulka Test',
        price: 149.99,
        description: 'Test koszulka',
        image: '/placeholder.svg',
        categoryId: 2,
      },
    }),
  ]);

  // Utwórz użytkownika testowego (zgodny z TEST_USER w test-data.ts)
  const hashedPassword = await argon2.hash('test123');

  await prisma.user.create({
    data: {
      id: 1,
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding test database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
