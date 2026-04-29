/// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    // Exclude Cypress files so Vitest never picks them up as test suites
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.cy.{js,jsx,ts,tsx}",
      "**/cypress/**",
    ],
  },
});
