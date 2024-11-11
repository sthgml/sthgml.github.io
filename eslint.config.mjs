import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  // 기본 ESLint 추천 설정
  js.configs.recommended,
  // Prettier와의 통합
  prettier,
  // 파일 무시 설정
  {
    ignores: [
      'gatsby-browser.js',
      'gatsby-config.js',
      'gatsby-node.js',
      'gatsby-ssr.js'
    ],
  },
  // React 설정
  {files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {
    languageOptions: { 
      globals: globals.browser,  
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react,
    },
    rules: {
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'semi': ['error', 'always'], // 항상 세미콜론 사용
      'indent': ['error', 2], // 들여쓰기는 2칸
      'max-len': ['warn', { code: 80 }], // 한 줄 최대 80자
      'react/no-unescaped-entities': 'off'
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // TypeScript 설정
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
];

