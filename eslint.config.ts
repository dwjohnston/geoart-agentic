import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import importPlugin from "eslint-plugin-import";
import { createImportNoRestrictedPathsZones } from './tooling/eslint/configureImportRules';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      importPlugin.flatConfigs.typescript
    ],


    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    rules: {
      "import/no-restricted-paths": ["warn", {
        "zones": [
          ...createImportNoRestrictedPathsZones({
            "application": "src/application",
            "algorithms": "src/algorithms",
            "common-tooling": "src/common-tooling",
            "ui-tooling": "src/ui-tooling",
            "theSchema": "src/schema",
            "compiler": "src/graphEngine/compiler",
            "evaluator": "src/graphEngine/evaluator",
            "graphEngine": "src/graphEngine/graphEngine",
            // "graphEngineBase": "src/graphEngine"
          }, {
            "application": {
              allowedZones: ["common-tooling", "ui-tooling", "theSchema", "graphEngine", "algorithms"]
            },
            "algorithms": {
              allowedZones: ["common-tooling", "ui-tooling", "theSchema"]
            },
            "common-tooling": {
              allowedZones: []
            },
            "ui-tooling": {
              allowedZones: []
            },
            "theSchema": {
              allowedZones: ["common-tooling", "ui-tooling"]
            },
            "compiler": {
              allowedZones: ["common-tooling", "ui-tooling", "theSchema"]
            },
            "evaluator": {
              allowedZones: ["common-tooling", "ui-tooling", "theSchema", "compiler"]
            },
            // graphEngineBase: {
            //   "allowedZones": [],
            // },
            "graphEngine": {
              allowedZones: ["common-tooling", "ui-tooling", "theSchema", "compiler", "evaluator", "algorithms"]
            },

          })
        ]
      }],
    },
  },


])
