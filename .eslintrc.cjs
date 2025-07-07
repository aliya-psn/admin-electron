module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  // ​​优先级顺序​​：@vue/prettier 默认配置 > 项目 ESLint 规则 > 本地 Prettier 配置
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/typescript/recommended', '@vue/prettier'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      tsx: true
    }
  },
  rules: {
    // TS
    '@typescript-eslint/no-explicit-any': 'off', // 避免 any warn
    'no-debugger': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    // Vue
    'vue/no-v-html': 'warn', // 防止 XSS
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],
    // .eslintrc.js
    'prettier/prettier': ['error', {}, { usePrettierrc: true }] // 强制使用项目配置
  }
};
