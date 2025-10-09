/**
 * Konfiguracja ESLint dla projektu Backend (NestJS + TypeScript)
 *
 * ESLint to narzędzie do statycznej analizy kodu JavaScript/TypeScript,
 * które pomaga wykrywać błędy i egzekwować spójny styl kodowania.
 *
 * Ten plik używa nowego formatu "flat config" (ESLint 9+) z funkcją defineConfig
 */

// === IMPORTY WTYCZEK I KONFIGURACJI ===

import js from "@eslint/js";                                  // Podstawowe reguły JavaScript od ESLint
import { defineConfig, globalIgnores } from 'eslint/config';  // Funkcje pomocnicze do konfiguracji
import importPlugin from 'eslint-plugin-import';              // Reguły dla instrukcji import/export
import globals from "globals";                                // Definicje zmiennych globalnych (np. process, Buffer)
import tseslint from "typescript-eslint";                     // Integracja TypeScript z ESLint

export default defineConfig([
  // === IGNOROWANE PLIKI ===
  // Foldery i pliki, które nie powinny być sprawdzane przez ESLint
  globalIgnores([
    'dist',           // Skompilowany kod produkcyjny
    'node_modules',   // Zależności zewnętrzne
    '**/*.spec.ts'    // Pliki testów jednostkowych (sprawdzane oddzielnie)
  ]),

  // === BAZOWA KONFIGURACJA JAVASCRIPT ===
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],  // Typy plików do sprawdzenia
    plugins: { js },                           // Wtyczka JavaScript
    extends: ["js/recommended"],               // Zalecane reguły JavaScript
    languageOptions: {
      globals: globals.node                    // Zmienne globalne Node.js (process, Buffer, __dirname, itp.)
    }
  },

  // === KONFIGURACJA TYPESCRIPT ===
  tseslint.configs.recommended,                // Zalecane reguły TypeScript

  // === KONFIGURACJA SORTOWANIA IMPORTÓW ===
  {
    plugins: { import: importPlugin },         // Wtyczka do zarządzania importami
    rules: {
      // Wymuszaj określoną kolejność importów dla lepszej czytelności
      'import/order': ['error', {
        'groups': [
          'builtin',    // Wbudowane moduły Node.js (fs, path, http)
          'external',   // Pakiety npm (@nestjs/common, prisma)
          'internal',   // Aliasy wewnętrzne (@/) - jeśli zdefiniowane w tsconfig
          'parent',     // Importy z katalogu nadrzędnego (../)
          'sibling',    // Importy z tego samego katalogu (./)
          'index'       // Importy z pliku index
        ],
        'newlines-between': 'always',          // Puste linie między grupami importów
        'alphabetize': { order: 'asc' }        // Sortuj alfabetycznie w ramach grupy
      }],
      'import/no-duplicates': 'error',         // Błąd przy duplikatach importów z tego samego modułu
      'import/no-unresolved': 'off',           // TypeScript sprawdza poprawność importów
    }
  }
]);
