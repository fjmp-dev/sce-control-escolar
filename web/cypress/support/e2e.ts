import type { AxeResults } from 'axe-core';

export const API = 'http://localhost:3001';
export const CONTRASENA = 'sce-dev-2026';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      iniciar(correo: string, contrasena?: string): Chainable<void>;
      campo(etiqueta: string): Chainable<JQuery<HTMLElement>>;
      revisarAxe(nombre: string): Chainable<void>;
    }
  }
}

/**
 * La captura de página completa pega varias vistas desplazadas: la barra lateral, que es sticky, saldría repetida.
 * Durante la captura queda estática.
 */
Cypress.Screenshot.defaults({
  onBeforeScreenshot: ($el) => Cypress.$($el).find('.navegacion-lista').css('position', 'static'),
  onAfterScreenshot: ($el) => Cypress.$($el).find('.navegacion-lista').css('position', ''),
});

/** Por la etiqueta visible, como lo haria una persona: si la etiqueta no esta asociada al campo, falla (28.1). */
Cypress.Commands.add('campo', (etiqueta: string) =>
  cy
    .contains('label', new RegExp(`^${etiqueta}$`))
    .invoke('attr', 'for')
    .then((id) => cy.get(`[id="${id}"]`)),
);

Cypress.Commands.add('iniciar', (correo: string, contrasena = CONTRASENA) => {
  cy.visit('/ingresar');
  cy.campo('Correo institucional').type(correo);
  cy.campo('Contraseña').type(contrasena, { log: false });
  cy.contains('button', 'Entrar').click();
  cy.contains('h1', 'Inicio');
});

/** 28.2 y Tabla 42: lista de incumplimientos WCAG 2.2 AA por pagina. Falla cerrada: sin reglas evaluadas, no hay aprobado. */
Cypress.Commands.add('revisarAxe', (nombre: string) => {
  cy.readFile('node_modules/axe-core/axe.min.js').then((codigo: string) => {
    cy.window()
      .then((ventana) => {
        ventana.eval(codigo);
        const axe = (
          ventana as unknown as { axe: { run: (contexto: Document, opciones: object) => Promise<AxeResults> } }
        ).axe;
        return axe.run(ventana.document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
      })
      .then((resultado) => {
        cy.writeFile(`cypress/reportes/axe/${nombre}.json`, {
          pagina: resultado.url,
          fecha: resultado.timestamp,
          motor: resultado.testEngine,
          reglasAprobadas: resultado.passes.length,
          incumplimientos: resultado.violations,
          // Lo que axe no pudo decidir (p. ej. texto sobre un degradado): queda como evidencia de revisión manual.
          sinDecidir: resultado.incomplete.map((r) => ({ id: r.id, nodos: r.nodes.map((n) => n.target.join(' ')) })),
        });
        expect(resultado.passes.length, 'reglas evaluadas').to.be.greaterThan(0);
        expect(
          resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
          'incumplimientos WCAG',
        ).to.deep.equal([]);
      });
  });
});
