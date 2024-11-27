import antfu from '@antfu/eslint-config'

export default antfu({
  svelte: true,
  typescript: true,
  rules: {
    'svelte/html-quotes': [
      'error',
      {
        prefer: 'double',
        dynamic: {
          quoted: false,
          avoidInvalidUnquotedInHTML: false,
        },
      },
    ],
    'unused-imports/no-unused-vars': ['error', { varsIgnorePattern: '(^_)|heroImage' }],
    'no-unused-vars': ['error', { varsIgnorePattern: '(^_)|heroImage' }],
  },
  ignores: [
    'node_modules',
    '/build',
    '/.svelte-kit',
    '/package',
    '.env',
    '.env.*',
    '!.env.example',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    'types-template.ts',
    'packages/twoslash/__tests__/test.svelte',
    'packages/twoslash/src/twoslash-svelte/types-template.d.ts',
    '*.md',
    '**/__tests__/**/*.svelte',
    '**/__tests__/**/*.json',
    '**/__tests__/**/*.tsx',
    '**/.sveltepress/**/*',
  ],
}, {
  files: ['**/*.svelte'],
  rules: {
    'prefer-const': 'off',
    'antfu/if-newline': 'off',
    'style/operator-linebreak': 'off',
    'style/brace-style': 'off',
    'svelte/indent': 'off',
  },
}, {
  files: ['packages/create/template-*/**/*'],
  rules: {
    'style/indent': ['error', 'tab'],
    'style/no-tabs': 'off',
  },
})
