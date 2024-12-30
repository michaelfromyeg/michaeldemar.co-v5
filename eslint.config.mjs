import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: [
      '.git/**',
      '.next/**',
      'node_modules/**',
      'public/**',
      'build/**',
      'dist/**',
      'data/*.json',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.config({
    extends: ['next', 'prettier'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }),
]

export default eslintConfig
