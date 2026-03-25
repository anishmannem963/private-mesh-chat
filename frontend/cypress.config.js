import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    viewportWidth: 1280,
    viewportHeight: 800,
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // Implement component testing node events here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },

  e2e: {
    baseUrl: 'http://localhost:5173', // Update this to match your Vite dev server port
    viewportWidth: 1280,
    viewportHeight: 800,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // Implement e2e testing node events here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
  
  // Global configuration
  includeShadowDom: true,
  defaultCommandTimeout: 6000,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  video: false,
  screenshotOnRunFailure: true,
});