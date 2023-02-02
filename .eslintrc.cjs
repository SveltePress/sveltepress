module.exports = {
  extends: ['@casual-ui/eslint-config-svelte'],
  rules: {
    'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
  },
}
