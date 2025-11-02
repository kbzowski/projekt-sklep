import { Page } from '@playwright/test';
import { TEST_USER, ROUTES } from './test-data';

/**
 * Helper uwierzytelniania dla testów e2e
 *
 * Funkcje pomocnicze do logowania użytkowników testowych.
 */

/**
 * Loguje testowego użytkownika
 *
 * @param page - Instancja Playwright Page
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto(ROUTES.LOGIN);

  // Wypełnij dane logowania
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);

  // Wyślij formularz i poczekaj na nawigację
  await page.click('button[type="submit"]');
  await page.waitForURL(ROUTES.HOME, { timeout: 10000 });
}
