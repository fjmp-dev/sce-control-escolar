// Interfaz Next.js y NestJS (Tabla 44): autenticacion JWT y codigos de error de negocio; CS-SEG-07 visto desde el portal.
import { API } from '../support/e2e';

// El secreto por omision del ambiente Compose: solo sirve para simular un token a punto de vencer.
const SECRETO_LOCAL = 'solo-para-el-ambiente-local-de-pruebas';
const decodificar = (token: string) =>
  JSON.parse(atob(token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/'))) as {
    sub: string;
    sv: number;
    ini: number;
    exp: number;
  };
const base64url = (datos: ArrayBuffer | string) =>
  btoa(typeof datos === 'string' ? datos : String.fromCharCode(...new Uint8Array(datos)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

async function firmar(reclamos: object) {
  const mensaje = `${base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${base64url(JSON.stringify(reclamos))}`;
  const clave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRETO_LOCAL),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return `${mensaje}.${base64url(await crypto.subtle.sign('HMAC', clave, new TextEncoder().encode(mensaje)))}`;
}

describe('Autenticacion en el portal', () => {
  it('sin sesion, toda pagina lleva a iniciar sesion y no muestra datos', () => {
    for (const pagina of ['/', '/usuarios', '/facultades', '/materias', '/contrasena']) {
      cy.visit(pagina);
      cy.location('pathname').should('eq', '/ingresar');
    }
  });

  it('errores con causa y correccion: campo marcado, credenciales rechazadas, y lo escrito no se pierde', () => {
    cy.visit('/ingresar');
    cy.contains('button', 'Entrar').click();
    cy.get('[role=alert]').should('contain', 'Revisa los campos marcados').and('have.focus');
    cy.campo('Correo institucional').should('have.attr', 'aria-invalid', 'true');
    cy.contains('Escribe un correo completo');
    cy.screenshot('ingresar-campos-marcados');

    cy.campo('Correo institucional').clear().type('nadie@sce.test');
    cy.campo('Contraseña').type('no-es-la-contrasena-1');
    cy.contains('button', 'Entrar').click();
    cy.get('[role=alert]').should('contain', 'Correo o contraseña incorrectos');
    cy.campo('Correo institucional').should('have.value', 'nadie@sce.test');
    cy.campo('Contraseña').should('have.value', '');
  });

  it('el token vive en una cookie httpOnly: el navegador no lo lee', () => {
    cy.iniciar('caja@sce.test');
    cy.getCookie('sce_sesion').should('have.property', 'httpOnly', true);
    cy.getCookie('sce_sesion').should('have.property', 'sameSite', 'lax');
    cy.document().its('cookie').should('not.contain', 'sce_sesion');
    cy.window().then((ventana) => {
      expect(JSON.stringify(ventana.localStorage)).not.to.contain('eyJ');
      expect(JSON.stringify(ventana.sessionStorage)).not.to.contain('eyJ');
    });
    cy.document().its('documentElement.outerHTML').should('not.contain', 'eyJ');
  });

  it('CS-SEG-07: cerrar sesion borra la cookie y revoca el token en la API', () => {
    cy.iniciar('direccion@sce.test');
    cy.getCookie('sce_sesion').then((cookie) => {
      cy.contains('button', 'Cerrar sesión').click();
      cy.location('pathname').should('eq', '/ingresar');
      cy.getCookie('sce_sesion').should('be.null');
      cy.request({
        url: `${API}/sesiones/actual`,
        headers: { Authorization: `Bearer ${cookie?.value}` },
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 401);
    });
  });

  it('un token revocado en otra sesion lleva a iniciar sesion, con el motivo', () => {
    cy.iniciar('profesor@sce.test');
    cy.getCookie('sce_sesion').then((cookie) => {
      cy.request({
        method: 'DELETE',
        url: `${API}/sesiones/actual`,
        headers: { Authorization: `Bearer ${cookie?.value}` },
      });
    });
    cy.visit('/facultades');
    cy.location('pathname').should('eq', '/ingresar');
    cy.contains('Tu sesión terminó');
  });

  it('Tabla 38: un token por vencer se renueva solo mientras se usa el portal', () => {
    cy.iniciar('caja@sce.test');
    cy.getCookie('sce_sesion').then(async (cookie) => {
      const { sub, sv, ini } = decodificar(cookie?.value ?? '');
      const porVencer = await firmar({ sub, sv, ini, iat: ini, exp: Math.floor(Date.now() / 1000) + 120 });
      cy.setCookie('sce_sesion', porVencer, { httpOnly: true });
    });
    cy.visit('/facultades');
    cy.contains('h1', 'Facultades');
    cy.getCookie('sce_sesion').then((cookie) => {
      const { exp, ini } = decodificar(cookie?.value ?? '');
      expect(exp - Math.floor(Date.now() / 1000), 'el token nuevo dura mas').to.be.greaterThan(50 * 60);
      expect(ini, 'conserva el inicio de la sesion').to.be.a('number');
    });
  });

  it('/salud de la web responde sin sesion (Tabla 57)', () => {
    cy.request('/salud').its('body').should('deep.equal', { estado: 'ok' });
  });
});
