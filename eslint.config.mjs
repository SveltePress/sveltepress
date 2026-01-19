import antfu from '@antfu/eslint-config'

export default antfu({
  svelte: true,
  yaml: true,
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
    'packages/create/template-*/**/*',
  ],
}, {
  files: ['**/*.svelte'],
  rules: {
    'prefer-const': 'off',
    'antfu/if-newline': 'off',
    'style/operator-linebreak': 'off',
    'style/brace-style': 'off',
    'svelte/indent': 'off',
    'style/arrow-parens': 'off',
  },
}, {
  files: ['packages/docs-site*/**/*'],
  rules: {
    'unused-imports/no-unused-vars': 'off',
    'no-unused-vars': 'off',
  },
})
