// CO-COM-01, Tabla 50: pago simulado del alumno (iniciar, aprobar y recibo). El rechazo del banco es de Cypress
// (pagos-tramites.cy.ts). Caja genera antes un cargo propio de la corrida en 2026A, cerrado, cuyo único inscrito es
// 2420001 (alumno@sce.test): así hay adeudo en una base limpia y no se toca el de alumno.dos, que paga Cypress. El
// alumno paga su saldo completo, de modo que la cuenta queda en cero aunque una corrida anterior haya dejado adeudo.
import { cerrarSesion, expect, iniciarSesion, test } from './fixtures';

test('alumno: iniciar, aprobar y recibo del pago simulado', async ({ page, revisar, activar }, testInfo) => {
  await iniciarSesion(page, 'caja@sce.test');
  await page.goto('/caja');
  const cargos = page.locator('form').filter({ has: page.getByRole('button', { name: 'Generar los cargos' }) });
  await cargos.getByLabel('Periodo').selectOption('2026A');
  await cargos.getByLabel('Concepto').fill(`CO-COM-01 ${testInfo.project.name} ${Date.now()}`);
  await cargos.getByLabel('Importe por alumno, en pesos').fill('10');
  await cargos.getByRole('button', { name: 'Generar los cargos' }).click();
  await expect(cargos.getByRole('status')).toContainText(/cargos nuevos, [1-9]/);
  await cerrarSesion(page);

  await iniciarSesion(page, 'alumno@sce.test');
  await page.goto('/mi-cuenta');
  const adeudo = await page.locator('.saldo-adeudo .cifra-valor').innerText(); // "$10.00"
  const importe = page.getByLabel('Importe a pagar, en pesos');
  await importe.fill(adeudo.replace(/[^\d.]/g, ''));
  const pagar = page.getByRole('button', { name: 'Ir a pagar' });
  await revisar('mi-cuenta', importe, pagar);
  await activar(pagar);

  await expect(page.getByRole('heading', { level: 1, name: 'Pasarela de pago' })).toBeVisible();
  const aprobar = page.getByRole('button', { name: 'Aprobar el pago' });
  await revisar('pasarela', aprobar, page.getByRole('button', { name: 'Rechazar el pago' }));
  await activar(aprobar);

  await expect(page.getByRole('heading', { level: 1, name: 'Recibo de pago' })).toBeVisible();
  const recibo = page.getByRole('region', { name: 'Recibo de pago' });
  await expect(recibo.locator('dt:text-is("Importe") + dd')).toHaveText(adeudo);
  await expect(recibo.locator('dt:text-is("Saldo después del pago") + dd')).toHaveText('$0.00');
  await revisar(
    'recibo',
    page.getByRole('button', { name: 'Imprimir recibo' }),
    page.getByRole('link', { name: 'Volver a mi cuenta' }),
  );
});
