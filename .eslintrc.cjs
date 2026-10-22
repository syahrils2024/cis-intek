module.exports = {
  root: true,
  ignorePatterns: ['src/main.jsx'],
  env: { browser: true, es2020: true },
  plugins: [
    'perfectionist',
    'unused-imports',
    'prettier',
    '@typescript-eslint',
    'eslint-plugin-import',
  ],
  extends: ['airbnb', 'airbnb/hooks', 'prettier', 'eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: '@typescript-eslint/parser',
  settings: {
    react: {
      version: 'detect',
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      alias: {
        map: [['src', './src', '@']],
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      },
    },
  },
  /**
   * 0 ~ 'off'
   * 1 ~ 'warn'
   * 2 ~ 'error'
   */
  rules: {
    radix: 0,
    'no-continue': 0,
    'no-plusplus': 0,
    'no-extend-native': 0,
    'react-hooks/exhaustive-deps': 0,
    'func-names': 0,
    'no-useless-return': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'react/display-name': 0,
    'no-use-before-define': 0,
    'import/no-extraneous-dependencies': 0,
    'no-alert': 0,
    camelcase: 0,
    'no-console': 0,
    'no-unused-vars': 0,
    'no-nested-ternary': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'no-restricted-exports': 0,
    'no-promise-executor-return': 0,
    'import/prefer-default-export': 0,
    'no-unreachable': 0,
    'prefer-destructuring': [1, { object: true, array: false }],
    // react
    'react/prop-types': 0,
    'react/no-children-prop': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.tsx'] }],
    'react/no-array-index-key': 0,
    'react/require-default-props': 0,
    'react/jsx-props-no-spreading': 0,
    'react/function-component-definition': 0,
    'react/jsx-no-duplicate-props': [1, { ignoreCase: false }],
    'react/jsx-no-useless-fragment': [1, { allowExpressions: true }],
    'react/no-unstable-nested-components': [1, { allowAsProps: true }],
    'no-extra-boolean-cast': 0,
    // jsx-a11y
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/control-has-associated-label': 0,
    // unused imports
    'unused-imports/no-unused-imports': 1,
    'unused-imports/no-unused-vars': [
      0,
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    // perfectionist
    'perfectionist/sort-exports': [1, { order: 'asc', type: 'line-length' }],
    'perfectionist/sort-named-imports': [1, { order: 'asc', type: 'line-length' }],
    'perfectionist/sort-named-exports': [1, { order: 'asc', type: 'line-length' }],
    'perfectionist/sort-imports': [
      1,
      {
        order: 'asc',
        type: 'line-length',
        'newlines-between': 'always',
        groups: [
          'style',
          'type',
          ['builtin', 'external'],
          'custom-mui',
          'custom-routes',
          'custom-hooks',
          'custom-utils',
          'internal',
          'custom-components',
          'custom-sections',
          'custom-auth',
          'custom-types',
          ['parent', 'sibling', 'index'],
          ['parent-type', 'sibling-type', 'index-type'],
          'object',
          'unknown',
        ],
        'custom-groups': {
          value: {
            ['custom-mui']: '@mui/**',
            ['custom-auth']: 'src/auth/**',
            ['custom-hooks']: 'src/hooks/**',
            ['custom-utils']: 'src/utils/**',
            ['custom-types']: 'src/types/**',
            ['custom-routes']: 'src/routes/**',
            ['custom-sections']: 'src/sections/**',
            ['custom-components']: 'src/components/**',
          },
        },
        'internal-pattern': ['src/**'],
      },
    ],
  },
};
