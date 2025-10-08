import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import pluginReact from 'eslint-plugin-react'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: pluginReact,
      '@stylistic': stylistic
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/no-unresolved': 'off', // Disable as it causes issues with flat config
      'import/named': 'off',
      'import/default': 'off',
      'import/namespace': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
    },
  },
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
]
