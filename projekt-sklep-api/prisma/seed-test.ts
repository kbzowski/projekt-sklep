/**
 * Test Database Seeder
 *
 * Seeds the database with test data for e2e tests.
 * This is separate from the main seed to allow for isolated test data.
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting test database seed...');

  // Clear database
  await prisma.refreshToken.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared test database');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { id: 1, name: 'Electronics', slug: 'electronics' },
    }),
    prisma.category.create({
      data: { id: 2, name: 'Clothing', slug: 'clothing' },
    }),
    prisma.category.create({
      data: { id: 3, name: 'Home & Garden', slug: 'home-garden' },
    }),
  ]);

  console.log(`✓ Created ${categories.length} categories`);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        id: 1,
        name: 'Test Laptop',
        price: 999.99,
        description: 'Test laptop for e2e testing',
        image: '/test-laptop.jpg',
        categoryId: 1,
      },
    }),
    prisma.product.create({
      data: {
        id: 2,
        name: 'Test Phone',
        price: 499.99,
        description: 'Test phone for e2e testing',
        image: '/test-phone.jpg',
        categoryId: 1,
      },
    }),
    prisma.product.create({
      data: {
        id: 3,
        name: 'Test Shirt',
        price: 29.99,
        description: 'Test shirt for e2e testing',
        image: '/test-shirt.jpg',
        categoryId: 2,
      },
    }),
    prisma.product.create({
      data: {
        id: 4,
        name: 'Test Chair',
        price: 149.99,
        description: 'Test chair for e2e testing',
        image: '/test-chair.jpg',
        categoryId: 3,
      },
    }),
  ]);

  console.log(`✓ Created ${products.length} products`);

  // Create test user
  // Password: test123
  const hashedPassword = await argon2.hash('test123');

  const user = await prisma.user.create({
    data: {
      id: 1,
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  console.log(`✓ Created test user: ${user.email}`);
  console.log('✓ Test database seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Email: test@example.com');
  console.log('  Password: test123');
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