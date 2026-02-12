import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Not part of the TS/Next project source tree.
    ".agent/**",
    ".antigravity/**",
    ".conda/**",
    ".mypy_cache/**",
    ".npm_cache/**",
    ".playwright-mcp/**",
    ".ruff_cache/**",
    ".tmp/**",
    "generated_posts/**",
    "playwright-report/**",
    "test-results/**",
    "logs/**",

    // Local/runtime artifacts (explicitly kept out of git).
    "dev.db",
    "prisma/dev.db",
    "server-debug.log",
    "public/sw.js",

    // Local scripts not intended for linting.
    "verify_sectors.js",
    "scripts/**",
  ]),

  // StrategyOS currently contains a lot of legacy/experimental code; keep lint
  // useful for real errors without blocking work on typing and JSX text.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
    },
  },
]);

export default eslintConfig;
