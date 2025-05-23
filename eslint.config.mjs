import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  typescript: true,
  test: true,
  javascript: true,
  rules: {
    'no-console': 'off',
    'no-new': 'off',
  },
})
