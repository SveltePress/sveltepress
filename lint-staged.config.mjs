export default {
  '*.{js,ts,svelte}': [
    'eslint',
    'pnpm test',
  ],
  '*.svelte': [
    'prettier . --check',
  ],
}
