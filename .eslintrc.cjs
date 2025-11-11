module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Enforce relative imports within same directory
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@pages/*', '@components/*'],
            message: 'Use relative imports for files in the same directory. Use path aliases (@atoms, @molecules, etc.) for cross-directory component imports.',
          },
        ],
      },
    ],
  },
};

