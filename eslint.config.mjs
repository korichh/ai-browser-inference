import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...compat.config({
    settings: {
      react: {
        version: "detect",
      },
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: ["./tsconfig.app.json", "./tsconfig.node.json"],
      ecmaVersion: 2020,
      sourceType: "module",
    },
    overrides: [
      {
        files: ["eslint.config.mjs"],
        parser: "espree",
      },
    ],
    extends: [
      // General best practices
      "eslint:recommended",
      "plugin:jsx-a11y/recommended",

      // Typescript best practices
      "plugin:@typescript-eslint/recommended",

      // React best practices
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",

      // Prettier support
      "prettier",
    ],
    rules: {
      // General rules
      semi: ["warn", "always"],
      quotes: ["warn", "double"],
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],
      "no-unused-vars": "off",

      // Typescript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/jsx-key": "warn",
    },
  }),
];

export default eslintConfig;
