// CO-COM-01, Tabla 50: inicio de sesión por rol, menú y cierre en cada navegador y resolución. Cypress ya comprueba qué
// ve cada rol (demostracion-por-rol.cy.ts); aquí se comprueba que el menú no se pierde: visible, alcanzable y operable.
import { ETIQUETA_ROL, ROLES, menuDe } from '../lib/roles';
import { CONTRASENA, cerrarSesion, expect, iniciarSesion, test } from './fixtures';

test('ingreso: el formulario se ve completo y se opera con teclado', async ({ page, revisar }) => {
  await page.goto('/ingresar');
  await revisar(
    'ingresar',
    page.getByLabel('Correo institucional'),
    page.getByLabel('Contraseña'),
    page.getByRole('button', { name: 'Entrar' }),
  );
});

for (const rol of ROLES) {
  test(`${ETIQUETA_ROL[rol]}: ingreso, menú y cierre`, async ({ page, revisar, activar }) => {
    await iniciarSesion(page, `${rol.replace('_', '.')}@sce.test`);
    await expect(page.getByRole('banner')).toContainText(ETIQUETA_ROL[rol]);

    // En celular y con zoom el menú va tras su botón (componentes/navegacion.tsx).
    const menu = page.getByRole('navigation', { name: 'Principal' });
    const boton = menu.getByRole('button', { name: 'Menú' });
    if (await boton.isVisible()) {
      await activar(boton);
      await expect(boton).toHaveAttribute('aria-expanded', 'true');
    }
    const enlaces = [{ ruta: '/', etiqueta: 'Inicio' }, ...menuDe([rol])];
    await revisar(
      `menu-${rol}`,
      ...enlaces.map(({ etiqueta }) => menu.getByRole('link', { name: etiqueta, exact: true })),
      page.getByRole('button', { name: 'Cerrar sesión' }),
    );

    // El primer enlace propio del rol lleva a su página.
    const { ruta, etiqueta } = enlaces[1];
    await activar(menu.getByRole('link', { name: etiqueta, exact: true }));
    await expect(page).toHaveURL(new RegExp(`${ruta}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await cerrarSesion(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/ingresar/);
  });
}

// 12.2, STRIDE (suplantación en el portal): Next.js compara Origin con Host antes de ejecutar una acción de servidor.
// Se envía el formulario de ingreso tal como lo manda un navegador sin JavaScript; desde otro origen no inicia sesión.
test('anti-CSRF: una acción de servidor con Origin ajeno no se ejecuta', async ({ page, baseURL }) => {
  await page.goto('/ingresar');
  const ocultos = await page
    .locator('form input[type=hidden]')
    .evaluateAll((campos) => campos.map((c) => [(c as HTMLInputElement).name, (c as HTMLInputElement).value]));
  expect(ocultos.length, 'el formulario lleva la referencia de la acción').toBeGreaterThan(0);
  const enviar = (origen: string) =>
    page.request.post('/ingresar', {
      multipart: { ...Object.fromEntries(ocultos), correo: 'alumno@sce.test', contrasena: CONTRASENA },
      headers: { Origin: origen },
      maxRedirects: 0,
    });

  const ajena = await enviar('https://atacante.example');
  expect(ajena.ok(), 'la acción ajena no responde 2xx').toBe(false);
  expect(ajena.headers()['set-cookie'] ?? '').not.toContain('sce_sesion=');
  // Control: la misma petición desde el origen del portal sí inicia sesión.
  const propia = await enviar(new URL(baseURL as string).origin);
  expect(propia.headers()['set-cookie']).toContain('sce_sesion=');
});
