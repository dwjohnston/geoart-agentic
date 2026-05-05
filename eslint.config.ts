import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import importPlugin from "eslint-plugin-import";
import { createImportNoRestrictedPathsZones } from './tooling/eslint/configureImportRules';
import vitest from "@vitest/eslint-plugin";

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { vitest },

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
      "vitest/no-focused-tests": "error",

      "import/no-restricted-paths": ["warn", {
        "zones": [
          ...createImportNoRestrictedPathsZones({
            "application": "src/application",
            "algorithms": "src/algorithms",
            "common-tooling": "src/common-tooling",
            "ui-tooling": "src/ui-tooling",
            "theSchema": "src/schema",
            "nodesControl": "src/nodes/control",
            "nodesCompute": "src/nodes/compute",
            "nodesRender": "src/nodes/render",
            "compiler": "src/graphEngine/compiler",
            "evaluator": "src/graphEngine/evaluator",
            "graphEngine": "src/graphEngine/graphEngine",
          }, {
            "application": {
              allowedZones: ["common-tooling", "ui-tooling", "theSchema", "graphEngine", "algorithms"]
            },
            "algorithms": {
              allowedZones: ["common-tooling", "theSchema"]
            },
            "common-tooling": {
              allowedZones: []
            },
            "ui-tooling": {
              allowedZones: []
            },
            "theSchema": {
              allowedZones: ["common-tooling"]
            },
            "compiler": {
              allowedZones: ["common-tooling", "theSchema"]
            },
            "evaluator": {
              allowedZones: ["common-tooling", "theSchema", "compiler"]
            },
            "graphEngine": {
              allowedZones: ["common-tooling", "theSchema", "compiler", "evaluator", "algorithms"]
            },
            "nodesCompute": {
              allowedZones: ["common-tooling", "theSchema"],
            },
            "nodesControl": {
              allowedZones: ["common-tooling", "theSchema", "ui-tooling"],
            },
            "nodesRender": {
              allowedZones: ["common-tooling", "theSchema"],
            }

          })
        ]
      }],
    },
  },


])
