/**
 * Helpery danych testowych
 *
 * Scentralizowane dane testowe dla spójnych testów e2e.
 * Demonstracja znaczenia utrzymywalnych danych testowych.
 *
 * WAŻNE: Te dane logowania muszą być zgodne z danymi seed testowej bazy danych
 * (zobacz projekt-sklep-api/prisma/seed-test.ts)
 */

export const TEST_USER = {
  email: 'test@example.com',
  password: 'test123',
  name: 'Test User',
};

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  CART: '/cart',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;
