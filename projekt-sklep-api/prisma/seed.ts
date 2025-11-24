import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as argon2 from 'argon2';

import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Wyczyść bazę danych
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
    prisma.category.create({
      data: { id: 3, name: 'Dom i Ogród', slug: 'dom-ogrod' },
    }),
    prisma.category.create({
      data: { id: 4, name: 'Sport', slug: 'sport' },
    }),
  ]);

  // Utwórz produkty
  await Promise.all([
    prisma.product.create({
      data: {
        id: 1,
        name: 'Laptop Dell XPS 13',
        price: 4999.99,
        description: 'Nowoczesny laptop z procesorem Intel Core i7',
        image: '/placeholder.svg',
        categoryId: 1,
      },
    }),
    prisma.product.create({
      data: {
        id: 2,
        name: 'Smartphone Samsung Galaxy',
        price: 2499.99,
        description: 'Flagowy smartfon z aparatem 108MP',
        image: '/placeholder.svg',
        categoryId: 1,
      },
    }),
    prisma.product.create({
      data: {
        id: 3,
        name: 'Koszulka Nike',
        price: 149.99,
        description: 'Sportowa koszulka z technologią Dri-FIT',
        image: '/placeholder.svg',
        categoryId: 2,
      },
    }),
    prisma.product.create({
      data: {
        id: 4,
        name: 'Jeansy Levi\'s 501',
        price: 299.99,
        description: 'Klasyczne jeansy straight fit',
        image: '/placeholder.svg',
        categoryId: 2,
      },
    }),
    prisma.product.create({
      data: {
        id: 5,
        name: 'Krzesło biurowe',
        price: 899.99,
        description: 'Ergonomiczne krzesło z regulacją wysokości',
        image: '/placeholder.svg',
        categoryId: 3,
      },
    }),
    prisma.product.create({
      data: {
        id: 6,
        name: 'Lampa stołowa',
        price: 199.99,
        description: 'Nowoczesna lampa LED z regulacją jasności',
        image: '/placeholder.svg',
        categoryId: 3,
      },
    }),
    prisma.product.create({
      data: {
        id: 7,
        name: 'Buty do biegania Adidas',
        price: 399.99,
        description: 'Lekkie buty z technologią Boost',
        image: '/placeholder.svg',
        categoryId: 4,
      },
    }),
    prisma.product.create({
      data: {
        id: 8,
        name: 'Piłka nożna',
        price: 89.99,
        description: 'Oficjalna piłka meczowa FIFA',
        image: '/placeholder.svg',
        categoryId: 4,
      },
    }),
    prisma.product.create({
      data: {
        id: 9,
        name: 'Tablet iPad Air',
        price: 2999.99,
        description: 'Tablet z ekranem Retina 10.9 cala',
        image: '/placeholder.svg',
        categoryId: 1,
      },
    }),
    prisma.product.create({
      data: {
        id: 10,
        name: 'Bluza z kapturem',
        price: 199.99,
        description: 'Ciepła bluza z bawełny organicznej',
        image: '/placeholder.svg',
        categoryId: 2,
      },
    }),
  ]);

  // Utwórz użytkowników testowych
  const hashedPassword1 = await argon2.hash('admin123');
  const hashedPassword2 = await argon2.hash('user123');

  await Promise.all([
    prisma.user.create({
      data: {
        id: 1,
        email: 'admin@example.com',
        password: hashedPassword1,
        name: 'Administrator',
      },
    }),
    prisma.user.create({
      data: {
        id: 2,
        email: 'user@example.com',
        password: hashedPassword2,
        name: 'Jan Kowalski',
      },
    }),
  ]);

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
