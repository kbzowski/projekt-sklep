/**
 * Test Data Helpers
 *
 * Centralized test data for consistent e2e testing.
 * This demonstrates the importance of maintainable test data.
 *
 * IMPORTANT: These credentials must match the test database seed data
 * (see projekt-sklep-api/prisma/seed-test.ts)
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

export const SELECTORS = {
  // Navigation
  NAV_HOME: 'a[href="/"]',
  NAV_PRODUCTS: 'a[href="/products"]',
  NAV_CART: 'a[href="/cart"]',
  NAV_LOGIN: 'a[href="/login"]',
  NAV_LOGOUT: 'button:has-text("Logout")',

  // Product elements
  PRODUCT_CARD: '[data-testid="product-card"]',
  ADD_TO_CART_BUTTON: 'button:has-text("Add to Cart")',
  PRODUCT_TITLE: '[data-testid="product-title"]',
  PRODUCT_PRICE: '[data-testid="product-price"]',

  // Cart elements
  CART_ITEM: '[data-testid="cart-item"]',
  CART_QUANTITY: '[data-testid="cart-quantity"]',
  REMOVE_FROM_CART: 'button:has-text("Remove")',
  CART_TOTAL: '[data-testid="cart-total"]',

  // Form elements
  EMAIL_INPUT: 'input[type="email"]',
  PASSWORD_INPUT: 'input[type="password"]',
  LOGIN_BUTTON: 'button[type="submit"]',
} as const;