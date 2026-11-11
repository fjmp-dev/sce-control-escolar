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
    // Electron sin pantalla abre en 1280x720 y recorta las capturas de 1366 y 1920 (Tabla 50).
    setupNodeEvents(on) {
      on('before:browser:launch', (navegador, opciones) => {
        if (navegador.name === 'electron') {
          opciones.preferences.width = 1920;
          opciones.preferences.height = 1080;
        }
        return opciones;
      });
    },
  },
});
