// CO-COM-01, Tabla 50: consulta de horario y de calificaciones del alumno. El contenido exacto lo comprueba Cypress
// (inscripcion.cy.ts y calificaciones.cy.ts); aquí, que las tablas se lean completas y sin desborde en cada combinación.
import { expect, iniciarSesion, test } from './fixtures';

test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, 'alumno@sce.test');
});

test('alumno: consulta su horario', async ({ page, revisar }) => {
  await page.goto('/mi-horario');
  await expect(page.getByRole('heading', { level: 1, name: 'Mi horario' })).toBeVisible();
  // Con la semilla, 2420001 tiene carga vigente en 2026B o, después de inscribirse, en 2027A.
  const sesiones = page
    .getByRole('table', { name: /^Mi horario de / })
    .first()
    .getByRole('row');
  await expect(sesiones.nth(1)).toBeVisible();
  await revisar('mi-horario');
});

test('alumno: consulta sus calificaciones', async ({ page, revisar }) => {
  await page.goto('/mis-calificaciones');
  await expect(page.getByRole('heading', { level: 1, name: 'Mis calificaciones' })).toBeVisible();
  await expect(page.getByRole('table').first()).toBeVisible();
  await revisar('mis-calificaciones', page.getByRole('link', { name: 'Descargar mi historial (CSV)' }));
});
