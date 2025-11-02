import { defineConfig, devices } from '@playwright/test';

/**
 * Konfiguracja Playwright dla testów E2E całego stosu (Full-Stack)
 *
 * Samodzielny projekt testów e2e testujący całą aplikację:
 * - Frontend (React + Vite)
 * - Backend (NestJS API)
 * - Baza danych (SQLite)
 *
 * Koncepcje edukacyjne:
 * - Separacja testów e2e od kodu aplikacji
 * - Koordynacja wielu serwerów
 * - Izolacja testów i zarządzanie bazą danych
 */
export default defineConfig({
  // Katalog z testami
  testDir: './tests',

  // Maksymalny czas wykonania pojedynczego testu
  timeout: 30 * 1000,

  // Uruchom pliki testowe równolegle
  fullyParallel: true,

  // Zawiedź build na CI jeśli przypadkowo zostawiono test.only w kodzie
  forbidOnly: !!process.env.CI,

  // Ponów próby tylko na CI
  retries: process.env.CI ? 2 : 0,

  // Liczba workerów (równoległe wykonywanie testów)
  workers: process.env.CI ? 1 : undefined,

  // Używane reportery
  reporter: [
    ['html'],
    ['list'],
  ],

  // Wspólne ustawienia dla wszystkich projektów
  use: {
    // Bazowy URL dla page.goto('/')
    baseURL: 'http://localhost:5173',

    // Zbieraj trace podczas ponowienia nieudanego testu
    trace: 'on-first-retry',

    // Screenshot przy błędzie
    screenshot: 'only-on-failure',

    // Video przy błędzie
    video: 'retain-on-failure',

    // Maksymalny czas dla każdej akcji
    actionTimeout: 10 * 1000,

    // Maksymalny czas dla każdej nawigacji
    navigationTimeout: 30 * 1000,
  },

  // Konfiguracja projektów dla różnych przeglądarek
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Odkomentuj aby testować na innych przeglądarkach
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Uruchom serwery frontend i backend przed rozpoczęciem testów
  webServer: [
    {
      // Serwer API (NestJS) - tryb testowy z test.db
      command: 'cd ../projekt-sklep-api && npm run db:reset:test && npm run start:test',
      url: 'http://localhost:9000/api',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // Serwer deweloperski frontend (Vite)
      command: 'cd ../projekt-sklep-ui && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});