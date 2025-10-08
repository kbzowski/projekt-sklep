/**
 * Plik konfiguracyjny testów Vitest
 *
 * Ten plik jest automatycznie uruchamiany przed wszystkimi testami.
 * Konfigurujemy tutaj:
 * - Matchery z @testing-library/jest-dom (toBeInTheDocument, toHaveClass, etc.)
 * - Globalne ustawienia środowiska testowego
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
 
// Automatyczne czyszczenie DOM po każdym teście
// Zapobiega "wyciekaniu" stanu między testami
afterEach(() => {
  cleanup()
})