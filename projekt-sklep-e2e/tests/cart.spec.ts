import { test, expect } from '@playwright/test';
import { ROUTES } from '../helpers/test-data';

/**
 * Cart Tests - Step by Step
 */

test.describe('Cart', () => {
  test('should redirect to login when accessing cart without auth', async ({ page }) => {
    await page.goto(ROUTES.CART);

    // Should redirect to login
    await page.waitForURL(ROUTES.LOGIN, { timeout: 5000 });
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });
});