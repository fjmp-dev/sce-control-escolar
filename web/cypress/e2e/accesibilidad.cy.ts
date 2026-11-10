// 28.1 y 28.2 (WCAG 2.2 AA, Tabla 42) y Tabla 50 (resoluciones). NVDA y Playwright son del Batch 12.
const RESOLUCIONES = [
  [1920, 1080],
  [1366, 768],
  [390, 844],
  [683, 384], // zoom de 200 % sobre 1366x768 (28.1)
];
const PAGINAS_ADMINISTRADOR = ['/', '/usuarios', '/facultades', '/planes', '/materias', '/periodos', '/contrasena'];

describe('Accesibilidad', () => {
  it('axe: inicio de sesion, con y sin errores', () => {
    cy.visit('/ingresar');
    cy.revisarAxe('ingresar');
    cy.contains('button', 'Entrar').click();
    cy.get('[role=alert]');
    cy.revisarAxe('ingresar-con-errores');
  });

  it('axe: todas las paginas del administrador', () => {
    cy.iniciar('administrador@sce.test');
    for (const pagina of PAGINAS_ADMINISTRADOR) {
      cy.visit(pagina);
      cy.get('h1');
      cy.revisarAxe(`administrador${pagina.replace('/', '-')}`);
    }
    cy.visit('/usuarios');
    cy.get('details').first().find('summary').click();
    cy.revisarAxe('administrador-usuarios-cambio-abierto');
    cy.contains('h2', 'Dar de alta').next('form').find('button').click();
    cy.get('[role=alert]');
    cy.revisarAxe('administrador-usuarios-con-errores');
  });

  it('axe: expedientes de control escolar, con y sin errores, y mi expediente', () => {
    cy.iniciar('control.escolar@sce.test');
    cy.visit('/expedientes?buscar=2420');
    cy.get('h1');
    cy.revisarAxe('control-escolar-expedientes');
    cy.contains('button', 'Dar de alta').click();
    cy.get('[role=alert]');
    cy.revisarAxe('control-escolar-expedientes-con-errores');
    cy.visit('/expedientes/2420003');
    cy.get('h1');
    cy.revisarAxe('control-escolar-expediente');
    cy.contains('button', 'Cerrar sesión').click();
    cy.iniciar('alumno@sce.test');
    cy.visit('/mi-expediente');
    cy.get('h1');
    cy.revisarAxe('alumno-mi-expediente');
  });

  it('axe: inscripcion del alumno, con aviso de choque y con rechazo, y en las tres resoluciones sin desborde', () => {
    cy.iniciar('alumno.dos@sce.test');
    cy.visit('/inscripcion');
    cy.get('h1');
    cy.revisarAxe('alumno-inscripcion');
    cy.contains('label', 'ISW-701-A').find('input').check();
    cy.contains('label', 'ISW-702-B').find('input').check();
    cy.contains('button', 'Revisar choques').click();
    cy.get('[role=status]').should('contain', 'choques de horario');
    cy.revisarAxe('alumno-inscripcion-aviso-de-choque');
    cy.contains('label', 'ISW-702-B').find('input').uncheck();
    cy.contains('button', 'Enviar carga').click();
    cy.get('[role=alert]');
    cy.revisarAxe('alumno-inscripcion-rechazada');
    for (const [ancho, alto] of RESOLUCIONES) {
      cy.viewport(ancho, alto);
      cy.document().then((documento) => {
        const raiz = documento.documentElement;
        expect(raiz.scrollWidth, `desborde horizontal en ${ancho}x${alto}`).to.be.at.most(raiz.clientWidth);
      });
      cy.screenshot(`inscripcion-${ancho}x${alto}`, { capture: 'fullPage' });
    }
  });

  it('axe: paginas de coordinacion y de alumno, y sin permiso', () => {
    cy.iniciar('coordinacion@sce.test');
    for (const pagina of ['/materias', '/periodos', '/oferta']) {
      cy.visit(pagina);
      cy.get('h1');
      cy.revisarAxe(`coordinacion${pagina.replace('/', '-')}`);
    }
    cy.contains('button', 'Definir grupo').click();
    cy.get('[role=alert]');
    cy.revisarAxe('coordinacion-oferta-con-errores');
    cy.contains('button', 'Cerrar sesión').click();
    cy.iniciar('profesor@sce.test');
    cy.visit('/mis-grupos');
    cy.get('h1');
    cy.revisarAxe('profesor-mis-grupos');
    cy.contains('button', 'Cerrar sesión').click();
    cy.iniciar('alumno@sce.test');
    for (const pagina of ['/materias', '/mi-horario']) {
      cy.visit(pagina);
      cy.get('h1');
      cy.revisarAxe(`alumno${pagina.replace('/', '-')}`);
    }
    cy.visit('/usuarios');
    cy.location('pathname').should('eq', '/sin-permiso');
    cy.revisarAxe('alumno-sin-permiso');
  });

  it('teclado: orden de foco logico y foco visible en el inicio de sesion', () => {
    cy.visit('/ingresar');
    const esperado = ['Saltar al contenido', 'correo', 'contrasena', 'Entrar'];
    for (const objetivo of esperado) {
      cy.press('Tab');
      cy.focused().should(($el) => {
        const texto = $el.attr('name') ?? $el.text();
        expect(texto).to.contain(objetivo);
        expect(getComputedStyle($el[0]).outlineStyle, `foco visible en ${objetivo}`).not.to.equal('none');
      });
    }
  });

  it('teclado: se entra con Enter y el menu se recorre con Tab', () => {
    cy.visit('/ingresar');
    cy.campo('Correo institucional').type('alumno@sce.test');
    cy.campo('Contraseña').type('sce-dev-2026{enter}', { log: false });
    cy.contains('h1', 'Inicio');
    cy.get('a.saltar').focus();
    cy.press('Enter');
    cy.location('hash').should('eq', '#contenido');
  });

  for (const [ancho, alto] of RESOLUCIONES) {
    it(`Tabla 50 y 28.1: sin desborde y con objetivos de al menos 24 px en ${ancho}x${alto}`, () => {
      cy.viewport(ancho, alto);
      cy.iniciar('administrador@sce.test');
      for (const pagina of PAGINAS_ADMINISTRADOR) {
        cy.visit(pagina);
        cy.get('h1');
        cy.document().then((documento) => {
          const raiz = documento.documentElement;
          expect(raiz.scrollWidth, `desborde horizontal en ${pagina}`).to.be.at.most(raiz.clientWidth);
          const controles = documento.querySelectorAll<HTMLElement>(
            'button, select, summary, .navegacion a, .casilla, input:not([type=hidden]):not([type=checkbox])',
          );
          for (const control of controles) {
            const { width, height } = control.getBoundingClientRect();
            if (width === 0 && height === 0) continue; // dentro de un details cerrado
            expect(Math.min(width, height), `objetivo en ${pagina}: ${control.outerHTML.slice(0, 60)}`).to.be.at.least(
              24,
            );
          }
        });
        cy.get('main button, main table, main p').first().should('be.visible');
      }
      cy.visit('/usuarios');
      cy.screenshot(`usuarios-${ancho}x${alto}`, { capture: 'fullPage' });
      cy.contains('button', 'Cerrar sesión').click();
      cy.iniciar('control.escolar@sce.test');
      for (const pagina of ['/expedientes?buscar=2420', '/expedientes/2420003']) {
        cy.visit(pagina);
        cy.get('h1');
        cy.document().then((documento) => {
          const raiz = documento.documentElement;
          expect(raiz.scrollWidth, `desborde horizontal en ${pagina}`).to.be.at.most(raiz.clientWidth);
        });
      }
      cy.screenshot(`expediente-${ancho}x${alto}`, { capture: 'fullPage' });
      cy.contains('button', 'Cerrar sesión').click();
      cy.iniciar('coordinacion@sce.test');
      cy.visit('/oferta');
      cy.get('h1');
      cy.document().then((documento) => {
        const raiz = documento.documentElement;
        expect(raiz.scrollWidth, 'desborde horizontal en /oferta').to.be.at.most(raiz.clientWidth);
        for (const control of documento.querySelectorAll<HTMLElement>(
          'main button, main select, main input:not([type=hidden])',
        )) {
          const { width, height } = control.getBoundingClientRect();
          expect(Math.min(width, height), `objetivo en /oferta: ${control.outerHTML.slice(0, 60)}`).to.be.at.least(24);
        }
      });
      cy.screenshot(`oferta-${ancho}x${alto}`, { capture: 'fullPage' });
    });
  }
});
