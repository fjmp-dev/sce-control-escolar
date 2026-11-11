// CF-HOR-01 (Tabla 43, Cypress) y RF-003: coordinacion abre un periodo, define grupos, el traslape de aula se comunica
// con causa y correccion antes de guardar (D-13), y publica la oferta (CC-012). El profesor ve su grupo y su horario.

const sesion = (dia: string, inicio: string, fin: string, aula: string) => {
  cy.campo('Día').select(dia);
  cy.campo('Hora de inicio').clear().type(inicio);
  cy.campo('Hora de fin').clear().type(fin);
  cy.campo('Aula').clear().type(aula);
};
const definir = (clave: string, profesor: string) => {
  cy.campo('Materia').select('ISW-101 Programación I');
  cy.campo('Clave del grupo').clear().type(clave);
  cy.campo('Correo del profesor').clear().type(profesor);
  cy.campo('Cupo').clear().type('30');
};

describe('Oferta del periodo (RF-003)', () => {
  // Los specs comparten el ambito global: las constantes van dentro del describe.
  const ANIO = String(3000 + (Date.now() % 6000));
  const PERIODO = `${ANIO}B`;

  it('CF-HOR-01: el traslape se avisa antes de guardar; la oferta se publica y el profesor ve su grupo', () => {
    cy.iniciar('coordinacion@sce.test');
    cy.visit('/periodos');
    cy.campo('Clave').type(PERIODO);
    cy.campo('Fecha de inicio').type(`${ANIO}-08-03`);
    cy.campo('Fecha de fin').type(`${ANIO}-12-18`);
    cy.contains('button', 'Abrir periodo').click();
    cy.get('[role=status]').should('contain', `Periodo ${PERIODO} abierto`);
    cy.contains('tr', PERIODO).should('contain', 'Sin publicar');

    cy.visit(`/oferta?periodo=${PERIODO}`);
    cy.contains('h1', `Oferta ${PERIODO}`);
    cy.contains('todavía no se publica');
    definir('G-A', 'profesor@sce.test');
    sesion('Lunes', '07:00', '09:00', 'A1');
    cy.contains('button', 'Definir grupo').click();
    cy.get('[role=status]').should('contain', `Grupo G-A definido en ${PERIODO}`);
    cy.contains('tr', 'G-A').should('contain', 'profesor@sce.test').and('contain', '0 de 30');

    // D-13: la misma aula a la misma hora, escrita en minusculas, con otro profesor.
    definir('G-B', 'profesor2@sce.test');
    sesion('Lunes', '08:00', '10:00', 'a1');
    cy.contains('button', 'Definir grupo').click();
    cy.get('[role=alert]').should(
      'contain',
      'El aula A1 ya está ocupada el lunes de 08:00 a 09:00 por el grupo G-A. Elige otra aula u otro horario.',
    );
    cy.campo('Clave del grupo').should('have.value', 'G-B');
    cy.contains('tr', 'G-B').should('not.exist');
    cy.revisarAxe('coordinacion-oferta-traslape');
    cy.screenshot('oferta-traslape-de-aula', { capture: 'fullPage' });

    cy.campo('Aula').clear().type('A2');
    cy.contains('button', 'Definir grupo').click();
    cy.get('[role=status]').should('contain', 'Grupo G-B definido');
    cy.contains('tr', 'G-B').should('contain', 'profesor2@sce.test');

    cy.contains('button', `Publicar la oferta de ${PERIODO}`).click();
    // El formulario de publicar desaparece; el aviso de la pagina, que es el mismo `role=status`, cambia en su lugar.
    cy.contains('[role=status]', 'Oferta publicada el').should('contain', 'Los alumnos la ven');
    cy.contains('button', 'Publicar la oferta').should('not.exist');
    cy.revisarAxe('coordinacion-oferta-publicada');
    cy.screenshot('oferta-publicada', { capture: 'fullPage' });

    cy.contains('button', 'Cerrar sesión').click();
    cy.iniciar('profesor2@sce.test');
    cy.visit('/mis-grupos');
    cy.contains('h2', `Periodo ${PERIODO}`)
      .parent()
      .within(() => {
        cy.contains('tr', 'G-B').should('contain', '0 de 30');
        cy.contains('tr', 'Lunes').should('contain', '08:00 a 10:00').and('contain', 'A2');
        cy.contains('G-A').should('not.exist');
      });
    cy.screenshot('profesor-mis-grupos', { capture: 'fullPage' });
  });
});
