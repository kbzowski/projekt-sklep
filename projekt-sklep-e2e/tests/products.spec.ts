import { test, expect } from '@playwright/test';
import { ROUTES } from '../helpers/test-data';

/**
 * Testy produktów - Krok po kroku
 */

test.describe('Products', () => {
  test('should load products page', async ({ page }) => {
    await page.goto(ROUTES.PRODUCTS);
    await expect(page).toHaveURL(ROUTES.PRODUCTS);
  });

  test('should display products from API', async ({ page }) => {
    await page.goto(ROUTES.PRODUCTS);

    // Poczekaj na załadowanie produktów
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Zweryfikuj, że wyświetlany jest przynajmniej jeden produkt
    const products = page.locator('[data-testid="product-card"]');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);

    // Zweryfikuj, że produkt ma wymagane elementy
    const firstProduct = products.first();
    await expect(firstProduct.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
  });
});