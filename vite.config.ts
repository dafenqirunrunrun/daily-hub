import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 32123,
    strictPort: true
  },
  test: {
    exclude: ["node_modules/**", "dist/**", "dist-electron/**", "tests/**/*.spec.ts"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts"
  },
  build: {
    outDir: "dist"
  }
});
