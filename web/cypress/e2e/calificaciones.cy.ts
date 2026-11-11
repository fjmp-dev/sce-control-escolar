// CF-CAL-01 (Tabla 43, Cypress), RF-004 y RF-005 sobre el seed: 2026B en curso con el parcial 1 de Bases de datos
// (ISW-301-B, de profesor@) y Auditoria de sistemas sin calificar (ISW-701-C, de profesor2@). Cierra 2026B.
const salir = () => cy.contains('button', 'Cerrar sesión').click();

describe('Calificaciones (RF-004 y RF-005)', () => {
  it('CF-CAL-01: captura en su grupo, consulta al momento, cierre con D-16, kardex, CSV y correccion D-17', () => {
    // El profesor captura el parcial 2 de su grupo.
    cy.iniciar('profesor@sce.test');
    cy.visit('/mis-grupos');
    cy.contains('a', 'ISW-301-B, calificaciones').click();
    cy.contains('h1', 'ISW-301 Bases de datos, grupo ISW-301-B');
    cy.location('pathname').as('grupo');
    cy.contains('h2', 'Capturar el parcial 1');
    cy.revisarAxe('profesor-captura');
    cy.get('#parcial').select('Parcial 2');
    cy.contains('button', 'Cambiar de parcial').click();
    cy.contains('h2', 'Capturar el parcial 2');
    cy.campo('Alumno Sintético Uno \\(2420001\\)').type('8');
    cy.campo('Alumno Sintético Dos \\(2420002\\)').type('6.5');
    cy.campo('Alumno Sintético Tres \\(2420003\\)').type('5.5');
    cy.contains('button', 'Guardar el parcial 2').click();
    cy.get('[role=status]').should('contain', 'Parcial 2 guardado: 3 calificaciones');
    cy.contains('tr', '2420001').should('contain', '9.00').and('contain', '8.00');
    cy.screenshot('profesor-captura-parcial-2', { capture: 'fullPage' });
    salir();

    // CI-CAL-01: el alumno lo ve en cuanto se guarda.
    cy.iniciar('alumno@sce.test');
    cy.visit('/mis-calificaciones');
    cy.contains('table', 'Bases de datos').contains('tr', 'ISW-301-B').should('contain', '9.00').and('contain', '8.00');
    cy.revisarAxe('alumno-mis-calificaciones');
    salir();

    // Otro profesor no entra al grupo.
    cy.iniciar('profesor2@sce.test');
    cy.get('@grupo').then((grupo) => cy.visit(String(grupo)));
    cy.location('pathname').should('eq', '/sin-permiso');
    salir();

    // D-16: coordinacion no cierra mientras falte Auditoria de sistemas.
    cy.iniciar('coordinacion@sce.test');
    cy.visit('/periodos');
    cy.contains('button', 'Cerrar el periodo 2026B').click();
    cy.get('[role=alert]').should('contain', 'No se puede cerrar 2026B').and('contain', 'grupo ISW-701-C');
    cy.revisarAxe('coordinacion-cierre-incompleto');
    salir();

    // El segundo profesor completa su grupo.
    cy.iniciar('profesor2@sce.test');
    cy.visit('/mis-grupos');
    cy.contains('a', 'ISW-701-C, calificaciones').click();
    cy.campo('Alumno Sintético Dos \\(2420002\\)').type('7');
    cy.contains('button', 'Guardar el parcial 1').click();
    cy.get('[role=status]').should('contain', 'Parcial 1 guardado: 1 calificación');
    salir();

    // RF-005: el cierre recalcula; despues ya no se captura.
    cy.iniciar('coordinacion@sce.test');
    cy.visit('/periodos');
    cy.contains('button', 'Cerrar el periodo 2026B').click();
    cy.get('[role=status]').should('contain', 'Periodo 2026B cerrado');
    cy.contains('tr', '2026B').should('contain', 'Cerrado');
    salir();

    // Kardex: (9 + 8) / 2 = 8.50; promedio de 8.17 y 8.50 = 8.34, half-up; 16 de 400 creditos.
    cy.iniciar('alumno@sce.test');
    cy.visit('/mis-calificaciones');
    cy.contains('table', 'Kárdex')
      .contains('tr', 'Bases de datos')
      .should('contain', '8.50')
      .and('contain', 'Acreditada');
    cy.contains('dd', '8.34');
    cy.contains('dd', '4.00 %');
    cy.request('/mis-calificaciones/historial.csv').then((res) => {
      expect(res.headers['content-type']).to.contain('text/csv');
      expect(res.body).to.contain('"2420001","2026B","ISW-301","Bases de datos","ISW-301-B","8","8.50","si","si"');
    });
    cy.screenshot('alumno-kardex', { capture: 'fullPage' });
    salir();

    // D-17: la correccion la autoriza coordinacion, con motivo y evidencia.
    cy.iniciar('coordinacion@sce.test');
    cy.visit('/correcciones?matricula=2420001');
    cy.campo('Calificación a corregir').select('2026B, ISW-301 Bases de datos, parcial 2: 8.00');
    cy.campo('Calificación correcta').type('10');
    cy.campo('Motivo').type('Error de captura del profesor');
    cy.campo('Evidencia').type('Oficio sintético CA-01');
    cy.revisarAxe('coordinacion-correccion');
    cy.contains('button', 'Autorizar la corrección').click();
    cy.get('[role=status]').should('contain', 'Calificación corregida y el historial de 2420001 recalculado');
    cy.contains('table', 'Kárdex').contains('tr', 'Bases de datos').should('contain', '9.50');
    cy.screenshot('coordinacion-correccion', { capture: 'fullPage' });
  });
});
