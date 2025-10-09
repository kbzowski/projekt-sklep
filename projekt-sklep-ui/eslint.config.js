/**
 * Konfiguracja ESLint dla projektu Frontend (React + TypeScript)
 *
 * ESLint to narzędzie do statycznej analizy kodu JavaScript/TypeScript,
 * które pomaga wykrywać błędy i egzekwować spójny styl kodowania.
 *
 * Ten plik używa nowego formatu "flat config" (ESLint 9+) zamiast .eslintrc
 */

// === IMPORTY WTYCZEK I KONFIGURACJI ===

import js from '@eslint/js'                         // Podstawowe reguły JavaScript od ESLint
import stylistic from '@stylistic/eslint-plugin'     // Reguły formatowania (wcięcia, cudzysłowy, średniki)
import importPlugin from 'eslint-plugin-import'      // Reguły dla instrukcji import/export
import pluginReact from 'eslint-plugin-react'        // Reguły specyficzne dla React
import globals from 'globals'                        // Definicje zmiennych globalnych (np. window, document)
import tseslint from 'typescript-eslint'             // Integracja TypeScript z ESLint

export default [
  // === IGNOROWANE PLIKI ===
  // Foldery, które nie powinny być sprawdzane przez ESLint
  {
    ignores: ['dist', 'node_modules'],
  },

  // === ROZSZERZENIE BAZOWYCH KONFIGURACJI ===
  js.configs.recommended,                             // Zalecane reguły JavaScript
  ...tseslint.configs.recommended,                    // Zalecane reguły TypeScript
  pluginReact.configs.flat.recommended,               // Zalecane reguły React
  pluginReact.configs.flat['jsx-runtime'],            // Konfiguracja dla nowego JSX transform (React 17+)

  // === GŁÓWNA KONFIGURACJA ===
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],  // Typy plików do sprawdzenia

    // Konfiguracja parsera i środowiska
    languageOptions: {
      globals: globals.browser,                       // Zmienne globalne przeglądarki (window, document, itp.)
      parser: tseslint.parser,                        // Parser TypeScript
      parserOptions: {
        ecmaVersion: 'latest',                        // Najnowsza wersja ECMAScript
        sourceType: 'module',                         // Używamy modułów ES (import/export)
        ecmaFeatures: {
          jsx: true,                                  // Włącz wsparcie dla JSX
        },
      },
    },

    // Ustawienia dla wtyczek
    settings: {
      react: {
        version: 'detect',                            // Automatycznie wykryj wersję React z package.json
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,                       // Sprawdzaj typy TypeScript przy resolving importów
          project: './tsconfig.json',                 // Ścieżka do konfiguracji TypeScript
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'], // Rozszerzenia plików do resolving
        },
      },
    },

    // Rejestracja wtyczek
    plugins: {
      '@typescript-eslint': tseslint.plugin,          // Wtyczka TypeScript
      react: pluginReact,                             // Wtyczka React
      '@stylistic': stylistic                         // Wtyczka formatowania
    },

    // === REGUŁY ===
    rules: {
      // TypeScript - nieużywane zmienne tylko ostrzeżenie (nie błąd)
      '@typescript-eslint/no-unused-vars': 'warn',

      // Wyłączone reguły import (problemy z flat config)
      'import/no-unresolved': 'off',                  // Wyłączone - TypeScript sprawdza to lepiej
      'import/named': 'off',
      'import/default': 'off',
      'import/namespace': 'off',

      // React - wyłącz przestarzałe reguły (React 17+)
      'react/react-in-jsx-scope': 'off',              // Nie trzeba importować React w plikach JSX (React 17+)
      'react/prop-types': 'off',                      // Używamy TypeScript zamiast PropTypes

      // Reguły formatowania kodu
      '@stylistic/indent': ['error', 2],              // Wcięcie 2 spacje
      '@stylistic/quotes': ['error', 'single'],       // Pojedyncze cudzysłowy
      '@stylistic/semi': ['error', 'never'],          // Brak średników na końcu linii
    },
  },

  // === KONFIGURACJA SORTOWANIA IMPORTÓW ===
  {
    plugins: { import: importPlugin },
    rules: {
      'import/order': ['error', {
        'groups': [
          'builtin',    // Wbudowane moduły Node.js (fs, path)
          'external',   // Pakiety npm (react, axios)
          'internal',   // Aliasy wewnętrzne (@/)
          ['parent', 'sibling', 'index']  // Wszystkie relative importy w jednej grupie
        ],
        'newlines-between': 'always',                 // Puste linie między grupami importów
        'alphabetize': { order: 'asc' }               // Sortuj alfabetycznie w grupach
      }],
      'import/no-duplicates': 'error',                // Błąd przy duplikatach importów
      'import/no-unresolved': 'off',                  // TypeScript sprawdza poprawność importów
    }
  }
]
