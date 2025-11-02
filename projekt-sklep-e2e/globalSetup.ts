import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Global Setup dla testów E2E
 *
 * Resetuje testowa bazę danych przed uruchomieniem testów e2e.
 * Zapewnia czysty stan bazy danych dla każdego uruchomienia testów.
 */
async function globalSetup() {
  try {
    // Ścieżka do projektu API
    const apiPath = path.resolve(__dirname, '../projekt-sklep-api');

    // Resetuj test database
    execSync('npm run db:reset:test', {
      cwd: apiPath,
      stdio: 'inherit',
    });

  } catch (error) {
    console.error('\nBłąd globalnego setupu testów E2E:', error);
    throw error;
  }
}

export default globalSetup;
