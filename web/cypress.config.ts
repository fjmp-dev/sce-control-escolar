import { defineConfig } from 'cypress';

// Tabla 42: video y capturas por caso. Corre contra el ambiente Compose, con scripts/cypress.sh.
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1366,
    viewportHeight: 768,
    retries: 0,
  },
});
