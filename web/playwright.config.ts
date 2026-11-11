import { defineConfig, devices } from '@playwright/test';

// CO-COM-01: la matriz de la Tabla 50 (sección 27) con los criterios de 28.1, contra un ambiente ya levantado
// (scripts/playwright.sh). Cada proyecto se llama prioridad-navegador-resolución: CI corre los must-* de modo que
// bloqueen y los should-* con continue-on-error, y scripts/matriz-compatibilidad.sh arma la tabla con el nombre.
const REPORTES = process.env.REPORTES_PLAYWRIGHT ?? '../reportes/playwright';
const ESCRITORIO = { width: 1366, height: 768 };
const CELULAR = { width: 390, height: 844 }; // la resolución de la Tabla 50, en vez del viewport del descriptor
// Firefox y Edge son Should y la Tabla 50 les pide sesión, consulta e inscripción: sin pago.
const SIN_PAGO = /pago\.spec\.ts/;

export default defineConfig({
  testDir: 'playwright',
  outputDir: `${REPORTES}/resultados`,
  // Las specs comparten las cuentas de la semilla (inscripción y pago de alumno@sce.test): en serie no se pisan.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: `${REPORTES}/html`, open: 'never' }],
    ['junit', { outputFile: `${REPORTES}/junit.xml` }],
  ],
  use: {
    baseURL: process.env.URL_BASE ?? 'http://localhost:3000',
    ignoreHTTPSErrors: true, // staging efímero usa un certificado autofirmado (scripts/staging.sh)
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Chrome estable del equipo (canal chrome), no el Chromium de Playwright.
    { name: 'must-chrome-1366x768', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: ESCRITORIO } },
    {
      name: 'must-chrome-1920x1080',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1920, height: 1080 } },
    },
    // Safari de iOS: Playwright no maneja Mobile Safari; WebKit con el descriptor del iPhone 14 (390x844) lo sustituye.
    { name: 'must-iphone-webkit-390x844', use: { ...devices['iPhone 14'], viewport: CELULAR } },
    { name: 'must-android-chromium-390x844', use: { ...devices['Pixel 7'], viewport: CELULAR } },
    // 28.1, zoom al 200 %: el navegador maqueta 1366x768 como si midiera la mitad en px CSS, con dos px físicos por px
    // CSS. deviceScaleFactor solo no basta, porque no cambia el ancho en px CSS ni las media queries.
    {
      name: 'must-zoom200-chromium-1366x768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 683, height: 384 }, deviceScaleFactor: 2 },
    },
    {
      name: 'should-firefox-1366x768',
      use: { ...devices['Desktop Firefox'], viewport: ESCRITORIO },
      testIgnore: SIN_PAGO,
    },
    // Edge estable (canal msedge): viene en las imágenes ubuntu-latest de GitHub; en macOS pide instalarlo con sudo.
    {
      name: 'should-edge-1366x768',
      use: { ...devices['Desktop Edge'], channel: 'msedge', viewport: ESCRITORIO },
      testIgnore: SIN_PAGO,
    },
  ],
});
