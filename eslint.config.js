export default [
  {
    files: ['*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
  {
    files: ['*.html'],
    languageOptions: {
      parser: '@angular-eslint/template-parser',
    },
    rules: {},
  },
];
