import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environmentMatchGlobs: [
      ["backend/tests/**/*.test.ts", "node"],
      ["frontend/tests/**/*.test.ts", "jsdom"],
    ],
    include: ["backend/tests/**/*.test.ts", "frontend/tests/**/*.test.ts"],
    reporters: ["default"],
  },
});

