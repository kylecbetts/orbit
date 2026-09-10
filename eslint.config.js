import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  { ignores: ['**/dist/**', '**/drizzle/**', '**/.pnpm-store/**'] },

  js.configs.recommended,

  // Type-aware rules only where there's a tsconfig to back them.
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },

  prettier,
])
