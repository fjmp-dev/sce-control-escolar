// RF-001 en el portal: CF-EXP-01 de punta a punta y CS-SEG-03 visto desde la interfaz.
const MATRICULA = `31${String(Date.now()).slice(-6)}`;

describe('Expediente', () => {
  it('control escolar da de alta, cambia de plantel y da de egreso el mismo expediente', () => {
    cy.iniciar('control.escolar@sce.test');
    cy.visit('/expedientes');
    cy.contains('button', 'Dar de alta').click();
    cy.get('[role=alert]').should('contain', 'Revisa los campos marcados');
    cy.contains('Escribe solo dígitos, de 7 a 10');

    cy.campo('Matrícula').type(MATRICULA);
    cy.campo('Nombre completo').type('Alumna de Prueba E2E');
    cy.campo('Facultad').select('CUTG');
    cy.campo('Fecha de ingreso').type('2025-08-04');
    cy.contains('button', 'Dar de alta').click();
    cy.get('[role=status]').should('contain', `Expediente ${MATRICULA} creado`);

    cy.get('#buscar').type(`${MATRICULA}{enter}`);
    cy.contains('a', MATRICULA).click();
    cy.contains('h1', 'Expediente de Alumna de Prueba E2E');
    cy.contains('Sin cambios de plantel.');

    cy.campo('Facultad destino').select('FSD');
    cy.contains('button', 'Cambiar de plantel').click();
    cy.get('[role=status]').should('contain', 'Cambio de plantel a FSD registrado');
    cy.contains('li', 'De CUTG a FSD');
    cy.contains('dd', `${MATRICULA}`);
    cy.screenshot('expediente-cambio-de-plantel');

    cy.campo('Nuevo estatus').select('Egresado');
    cy.contains('button', 'Cambiar estatus').click();
    cy.get('[role=status]').should('contain', 'Estatus actualizado');
    cy.contains('dd', 'Egresado');

    cy.campo('Facultad destino').select('CUTG');
    cy.contains('button', 'Cambiar de plantel').click();
    cy.get('[role=alert]').should('contain', 'solo un alumno activo cambia de plantel');

    cy.campo('Correo de la cuenta de alumno').type('caja@sce.test');
    cy.contains('button', 'Vincular cuenta').click();
    cy.get('[role=alert]').should('contain', 'No hay una cuenta activa de alumno');

    cy.visit('/expedientes?buscar=');
    cy.get('#buscar').type(`${MATRICULA}{enter}`);
    cy.contains('tr', MATRICULA).should('contain', 'FSD').and('contain', 'Egresado');
    cy.get('tr').filter(`:contains("${MATRICULA}")`).should('have.length', 1);
  });

  it('CS-SEG-03: cada alumno ve solo su expediente, y no hay ruta para ver otro', () => {
    cy.iniciar('alumno.dos@sce.test');
    cy.visit('/mi-expediente');
    cy.contains('dd', '2420002');
    cy.contains('Alumno Sintético Dos');
    cy.get('form').should('have.length', 1); // solo cerrar sesion
    cy.screenshot('mi-expediente');
    for (const pagina of ['/expedientes', '/expedientes/2420001']) {
      cy.visit(pagina);
      cy.location('pathname').should('eq', '/sin-permiso');
    }
  });
});
