import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __BACKEND_ENDPOINT__: JSON.stringify(
      process.env.FRONTEND_BACKEND_URL ?? "http://localhost:3000",
    ),
  },
});

