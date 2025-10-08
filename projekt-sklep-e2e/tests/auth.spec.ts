import { test, expect } from '@playwright/test';
import { TEST_USER, ROUTES } from '../helpers/test-data';

/**
 * Authentication E2E Tests - Step by Step
 */

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);

    // Verify we're on login page
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Submit form and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);

    // Should be on home page
    await expect(page).toHaveURL(ROUTES.HOME);

    // Verify user is logged in
    await expect(page.locator('button:has-text("Wyloguj")')).toBeVisible({
      timeout: 5000,
    });
  });
});