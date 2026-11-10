// CF-INS-01 y CF-INS-02 (Tabla 43, Cypress), CF-HOR-01 en el portal (aviso antes de confirmar) y D-14. Con video y capturas.
// Usa el seed: 2420001 acredito Programacion I en 2026A y cursa 2026B; 2420002 tiene adeudo; ISW-702-A no tiene lugares.
const oferta = (grupo: string) => cy.contains('label', grupo).find('input');
const estado = (texto: string) => cy.contains('.estado-inscripcion', texto);

describe('Inscripcion', () => {
  it('CF-INS-02: cada rechazo con estado y correccion propios; aviso de choque; confirmacion, comprobante y ajuste', () => {
    cy.iniciar('alumno@sce.test');
    cy.contains('nav a', 'Inscripción').click();
    cy.contains('h1', 'Inscripción 2027A');

    // CF-INS-01: Bases de datos pide Programacion II, que no ha acreditado.
    oferta('ISW-301-A').check();
    cy.contains('button', 'Enviar carga').click();
    cy.get('[role=alert]').should(
      'contain',
      'Te falta acreditar Programación II (ISW-201) para inscribir Bases de datos',
    );
    estado('Rechazada por prerrequisito faltante').should('contain', 'Quita de tu carga la materia');
    cy.screenshot('inscripcion-rechazo-prerrequisito');

    // CF-HOR-01: el choque se detecta y se avisa antes de enviar; revisar no cambia la inscripcion.
    oferta('ISW-301-A').uncheck();
    oferta('ISW-201-A').check();
    oferta('ISW-701-A').check();
    cy.contains('button', 'Revisar choques').click();
    cy.get('[role=status]')
      .should('contain', 'Aviso: Tu carga tiene choques de horario')
      .and('contain', 'se traslapan el lunes de 08:00 a 09:00');
    cy.focused().should('have.attr', 'role', 'status');
    estado('Rechazada por prerrequisito faltante');
    cy.screenshot('inscripcion-aviso-de-choque');
    cy.contains('button', 'Enviar carga').click();
    cy.get('[role=alert]').should('contain', 'Cambia uno de los dos grupos');
    estado('Rechazada por choque de horario');

    // Cupo agotado: se rechaza con su propio estado.
    oferta('ISW-701-A').uncheck();
    oferta('ISW-702-A').check();
    cy.contains('button', 'Enviar carga').click();
    cy.get('[role=alert]').should('contain', 'se quedó sin lugares');
    estado('Rechazada por grupo sin cupo');

    // Carga valida: se confirma con folio y comprobante.
    oferta('ISW-702-A').uncheck();
    oferta('ISW-701-B').check();
    cy.contains('button', 'Revisar choques').click();
    cy.get('[role=status]').should('contain', 'no tiene choques');
    cy.contains('button', 'Enviar carga').click();
    cy.get('[role=status]').should('contain', 'Inscripción confirmada');
    estado('Confirmada');
    cy.contains('section', 'Comprobante de inscripción')
      .should('contain', 'INS-2027A-2420001')
      .and('contain', 'ISW-201 · Programación II')
      .and('contain', 'ISW-701 · Auditoría de sistemas');
    cy.contains('button', 'Imprimir comprobante');
    cy.screenshot('inscripcion-comprobante', { capture: 'fullPage' });

    // Ajuste que no pasa: conserva la carga confirmada.
    oferta('ISW-702-A').check();
    cy.contains('button', 'Ajustar carga').click();
    cy.get('[role=alert]').should('contain', 'se quedó sin lugares');
    estado('Confirmada');
    cy.contains('section', 'Comprobante de inscripción').should('not.contain', 'ISW-702');

    // Ajuste valido: baja de un grupo y alta de otro.
    oferta('ISW-702-A').uncheck();
    oferta('ISW-701-B').uncheck();
    oferta('ISW-702-B').check();
    cy.contains('button', 'Ajustar carga').click();
    cy.get('[role=status]').should('contain', 'Carga ajustada');
    cy.contains('section', 'Comprobante de inscripción')
      .should('contain', 'ISW-702 · Ética profesional')
      .and('not.contain', 'ISW-701');

    // 3.4, impartición: su horario trae las sesiones de la carga ajustada, en orden de día y hora. También cursa 2026B.
    cy.contains('h2', 'Periodo 2026B');
    cy.visit('/mi-horario');
    cy.contains('h2', 'Periodo 2027A');
    cy.contains('section', 'Periodo 2027A').find('table tbody tr').should('have.length', 3);
    cy.contains('section', 'Periodo 2027A')
      .find('table tbody tr')
      .eq(0)
      .should('contain', 'Lunes')
      .and('contain', '07:00 a 09:00')
      .and('contain', 'ISW-201-A');
    cy.contains('section', 'Periodo 2027A')
      .find('table tbody tr')
      .eq(1)
      .should('contain', 'Lunes')
      .and('contain', '09:00 a 11:00')
      .and('contain', 'ISW-702-B');
    cy.contains('section', 'Periodo 2027A')
      .find('table tbody tr')
      .eq(2)
      .should('contain', 'Miércoles')
      .and('contain', 'ISW-201-A');
    cy.screenshot('alumno-mi-horario', { capture: 'fullPage' });
  });

  it('CF-INS-01: con adeudo vigente la carga queda rechazada con su estado y no se confirma', () => {
    cy.iniciar('alumno.dos@sce.test');
    cy.visit('/inscripcion');
    cy.get('input[name=grupos]').uncheck(); // si ya hubo un rechazo, su carga viene marcada
    oferta('ISW-701-B').check();
    cy.contains('button', 'Enviar carga').click();
    cy.get('[role=alert]').should('contain', 'Tienes un adeudo vigente');
    estado('Rechazada por adeudo').should('contain', 'Liquida tu adeudo en caja');
    cy.contains('Comprobante de inscripción').should('not.exist');
    cy.screenshot('inscripcion-rechazo-adeudo');
  });

  it('D-14: control escolar consulta las inscripciones del alumno y no puede inscribir', () => {
    cy.iniciar('control.escolar@sce.test');
    cy.visit('/expedientes/2420001');
    cy.contains('h2', 'Inscripciones');
    cy.contains('tr', 'INS-2026A-2420001').should('contain', 'Cerrada').and('contain', 'ISW-101 grupo ISW-101-A');
    cy.visit('/inscripcion');
    cy.location('pathname').should('eq', '/sin-permiso');
  });
});
