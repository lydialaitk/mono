import js from "@eslint/js";
import tseslint from "typescript-eslint";

const nodeGlobals = {
  console: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly",
};

const browserGlobals = {
  document: "readonly",
  fetch: "readonly",
  MutationObserver: "readonly",
  sessionStorage: "readonly",
  TextDecoder: "readonly",
  URL: "readonly",
  window: "readonly",
};

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "*.min.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["backend/**/*.ts", "vitest.config.ts"],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
  {
    files: ["frontend/**/*.ts", "shared/**/*.ts"],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...browserGlobals,
      },
    },
  },
];

