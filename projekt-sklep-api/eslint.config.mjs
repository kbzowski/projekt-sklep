import js from "@eslint/js";
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '**/*.spec.ts']),
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  {
    plugins: { import: importPlugin },
    rules: {
      'import/order': ['error', {
        'groups': [
          'builtin',    // Node.js built-ins (fs, path)
          'external',   // npm packages
          'internal',   // aliasy (@/)
          'parent',     // ../
          'sibling',    // ./
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc' }
      }],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript to załatwi
    }
  }
]);
