import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.wrangler/**', '**/.partykit/**', 'packages/engine/tsconfig.tsbuildinfo'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // Root/per-package build config isn't part of any package's own tsconfig
          // (tsconfig.json's "include" is just "src"/"test") — lint them as loose JS/TS
          // instead of erroring that they're outside the project.
          allowDefaultProject: ['eslint.config.mjs', 'packages/*/vite.config.ts', 'packages/*/vitest.config.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // The engine/server/web boundary relies on deliberate `as X` casts at redaction/
      // network edges (see CLAUDE.md's invariants) — those are documented, not accidental.
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['packages/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      // purity/refs are React Compiler prep rules — this project doesn't use the Compiler,
      // and the patterns they flag (useRef(Date.now()) for a one-time timestamp, syncing a
      // ref to the latest prop during render for a later callback to read) are standard,
      // correct, already-verified React patterns without it. Revisit if the Compiler is
      // ever adopted.
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
    },
  },
  {
    // Vitest test files and CLI scripts lean on `any`/non-null assertions for fixture
    // brevity and quick tooling — not worth the same strictness as rules/*.ts.
    files: ['**/test/**/*.ts', '**/*.test.ts', '**/cli/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // The plugins above don't ship precise types for their `configs` exports, which trips
    // up type-aware linting applied to this file itself — this is build tooling, not
    // application code, so the same relaxed rules as test/cli files apply. Must come last:
    // flat config merges in array order, and recommendedTypeChecked (above) sets these too.
    files: ['eslint.config.mjs'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  }
);
