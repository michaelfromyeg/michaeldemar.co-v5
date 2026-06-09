import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

const eslintConfig = [
  {
    ignores: [
      '.git/**',
      '.next/**',
      'node_modules/**',
      'public/**',
      'build/**',
      'dist/**',
      'out/**',
      '.vercel/**',
      'src/data/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'warn',
      // react-hooks 7's set-state-in-effect flags intentional, SSR-safe state
      // initialization on mount (matchMedia value, client-only random emoji),
      // which would otherwise cause hydration mismatches. Keep the rest of
      // react-hooks; just allow these deliberate cases.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Build-time scripts and the Notion data pipeline log intentionally.
    files: ['scripts/**', 'src/lib/notion/**'],
    rules: {
      'no-console': 'off',
    },
  },
]

export default eslintConfig
