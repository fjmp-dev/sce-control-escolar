// CO-COM-01, Tabla 50: inscripción del alumno (oferta, revisar choques y enviar) con teclado o con el dedo. Los rechazos
// son de Cypress (inscripcion.cy.ts). Tolera el estado previo: alterna entre dos cargas válidas, así que confirma la
// primera vez y ajusta las siguientes, en una base limpia o después de Cypress.
import { expect, iniciarSesion, test } from './fixtures';

const CARGA_A = ['ISW-201-A', 'ISW-702-B']; // la que deja Cypress
const CARGA_B = ['ISW-201-A', 'ISW-701-B'];

test('alumno: oferta, revisar choques y enviar', async ({ page, revisar, activar }) => {
  await iniciarSesion(page, 'alumno@sce.test');
  await page.goto('/inscripcion');
  const oferta = page.getByRole('group', { name: /^Oferta de / });
  await expect(oferta).toBeVisible();
  const casilla = (grupo: string) => oferta.getByRole('checkbox', { name: `grupo ${grupo}` });

  const carga = (await casilla('ISW-701-B').isChecked()) ? CARGA_A : CARGA_B;
  const marcadas = oferta.getByRole('checkbox', { checked: true });
  while ((await marcadas.count()) > 0) await activar(marcadas.first());
  for (const grupo of carga) await activar(casilla(grupo));
  for (const grupo of carga) await expect(casilla(grupo)).toBeChecked();

  const revisarChoques = page.getByRole('button', { name: 'Revisar choques' });
  const enviar = page.getByRole('button', { name: /^(Enviar|Ajustar) carga$/ });
  await activar(revisarChoques);
  await expect(page.getByRole('status').filter({ hasText: 'no tiene choques' })).toBeVisible();
  await activar(enviar);
  await expect(page.getByRole('status').filter({ hasText: /Inscripción confirmada|Carga ajustada/ })).toBeVisible();
  await expect(page.locator('.estado-inscripcion')).toContainText('Confirmada');
  const comprobante = page.getByRole('region', { name: 'Comprobante de inscripción' });
  for (const grupo of carga) await expect(comprobante).toContainText(grupo);

  // Se revisa la página recargada, que trae la misma carga marcada, el comprobante y los botones: en Firefox
  // (Playwright 1.65, macOS), axe.run tumba el proceso de la página si antes se marcaron casillas y corrió una acción
  // de servidor en el mismo documento. Sin axe no se reproduce.
  await page.reload();
  await revisar(
    'inscripcion',
    ...carga.map(casilla),
    revisarChoques,
    enviar,
    page.getByRole('button', { name: 'Imprimir comprobante' }),
  );
});
