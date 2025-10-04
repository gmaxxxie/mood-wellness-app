module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    curly: ['error', 'all'],
    'no-console': 'off',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js', '**/*.test.js'],
      env: {
        jest: true
      }
    }
  ]
};
