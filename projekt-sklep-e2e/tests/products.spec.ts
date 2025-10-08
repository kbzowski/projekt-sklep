import { test, expect } from '@playwright/test';
import { ROUTES } from '../helpers/test-data';

/**
 * Product Tests - Step by Step
 */

test.describe('Products', () => {
  test('should load products page', async ({ page }) => {
    await page.goto(ROUTES.PRODUCTS);
    await expect(page).toHaveURL(ROUTES.PRODUCTS);
  });

  test('should display products from API', async ({ page }) => {
    await page.goto(ROUTES.PRODUCTS);

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Verify at least one product is displayed
    const products = page.locator('[data-testid="product-card"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);

    // Verify product has required elements
    const firstProduct = products.first();
    await expect(firstProduct.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
  });
});