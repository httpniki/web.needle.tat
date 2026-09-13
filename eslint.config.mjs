import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importSort from 'eslint-plugin-simple-import-sort';
import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss';

const eslintConfig = defineConfig([
   ...nextVitals,
   ...nextTs,
   globalIgnores([
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
   ]),
   eslintPluginTailwindcss.configs.recommended,
   {
      plugins: {
         'simple-import-sort': importSort
      },
      settings: {
         tailwindcss: {
            cssConfigPath: './src/app/globals.css'
         }
      },
      rules: {
         'prefer-const': 'off',
         '@typescript-eslint/no-unused-vars': [
            'warn',
            {
               'varsIgnorePattern': '^_',
               'argsIgnorePattern': '^_',
               'caughtErrorsIgnorePattern': '^_'
            }
         ],
         'react-hooks/exhaustive-deps': 'off',
         'react-hooks/purity': 'off',
         'quotes': ['error', 'single'],
         'simple-import-sort/imports': 'error',
         'simple-import-sort/exports': 'error'
      }
   }
]);

export default eslintConfig;
