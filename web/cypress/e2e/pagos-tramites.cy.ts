// CF-PAG-01 con pasarela simulada y CF-TRA-01 y 02 (Batch 9) sobre el seed: alumno.dos (2420002) debe 1850.
// Paga (primero el banco rechaza y luego aprueba), pide su no adeudo, control escolar lo emite, el alumno lo descarga,
// control escolar verifica el folio y caja ve el pago en el corte del dia. Tambien un rechazo con motivo visible.
describe('Pagos simulados y tramites (RF-006, RF-007, RF-010)', () => {
  const salir = () => cy.contains('button', 'Cerrar sesión').click();
  const fila = (...textos: string[]) =>
    cy
      .get('table tbody tr')
      .filter((_, tr) => textos.every((t) => tr.textContent?.includes(t)))
      .first();
  const pagar = (importe: string) => {
    cy.visit('/mi-cuenta');
    cy.campo('Importe a pagar, en pesos').type(importe);
    cy.contains('button', 'Ir a pagar').click();
    cy.contains('h1', 'Pasarela de pago');
  };

  it('CF-PAG-01 y CF-TRA-01: paga su adeudo, pide su no adeudo, lo descarga y caja lo ve en el corte', () => {
    cy.iniciar('alumno.dos@sce.test');
    cy.visit('/mi-cuenta');
    cy.contains('.saldo', 'Adeudo: $1,850.00');
    cy.revisarAxe('alumno-mi-cuenta');

    pagar('1850');
    cy.revisarAxe('alumno-pasarela');
    cy.contains('button', 'Rechazar el pago').click();
    cy.get('[role=alert]').should('contain', 'El banco rechazó el pago');

    pagar('1850');
    cy.contains('button', 'Aprobar el pago').click();
    cy.contains('h1', 'Recibo de pago');
    cy.contains('dd', '$1,850.00');
    cy.contains('dt', 'Saldo después del pago').next().should('have.text', '$0.00');
    cy.revisarAxe('alumno-recibo');
    cy.visit('/mi-cuenta');
    cy.contains('.saldo', 'Sin adeudo.');
    fila('Pagado').should('contain', '$1,850.00');
    fila('Rechazado').should('contain', '$1,850.00');

    cy.visit('/mis-tramites');
    cy.get('select').first().select('Constancia de no adeudo');
    cy.contains('button', 'Solicitar').click();
    cy.get('[role=status]').should('contain', 'Solicitud recibida');
    fila('Constancia de no adeudo').should('contain', 'Recibida');
    cy.revisarAxe('alumno-mis-tramites');
    salir();

    cy.iniciar('control.escolar@sce.test');
    cy.visit('/tramites');
    fila('2420002', 'Constancia de no adeudo').within(() => cy.contains('button', 'Tomar').click());
    cy.get('[role=status]').should('contain', 'quedó en proceso');
    fila('2420002', 'Constancia de no adeudo').within(() => cy.contains('button', 'Emitir').click());
    cy.get('[role=status]').should('contain', 'quedó listo');
    cy.revisarAxe('control-escolar-tramites');
    cy.location('search').then((busqueda) => {
      const folio = new URLSearchParams(busqueda).get('folio') as string;
      cy.wrap(`DOC-${folio.slice(4)}`).as('documento');
    });
    salir();

    cy.iniciar('alumno.dos@sce.test');
    cy.visit('/mis-tramites');
    fila('Constancia de no adeudo').within(() => cy.contains('a', 'Descargar').click());
    cy.get('pre.documento').should('contain', 'no tiene adeudos').and('contain', '2420002');
    cy.revisarAxe('alumno-documento');
    cy.visit('/mis-tramites');
    fila('Constancia de no adeudo').should('contain', 'Entregada');
    salir();

    cy.iniciar('control.escolar@sce.test');
    cy.get('@documento').then((documento) => cy.visit(`/tramites?documento=${String(documento)}`));
    cy.get('[role=status]').should('contain', 'es auténtico');
    salir();

    cy.iniciar('caja@sce.test');
    cy.visit('/caja');
    fila('2420002').should('contain', '$1,850.00');
    cy.contains('.saldo', 'Total del día');
    cy.revisarAxe('caja');
    cy.visit('/caja?matricula=2420002');
    cy.contains('.saldo', 'Sin adeudo.');
    salir();
  });

  it('CF-TRA-02: el rechazo lleva motivo y el alumno lo ve', () => {
    const motivo = 'Faltan datos de la solicitud, prueba Cypress';
    cy.iniciar('alumno@sce.test');
    cy.visit('/mis-tramites');
    cy.get('select').first().select('Constancia de estudios');
    cy.contains('button', 'Solicitar').click();
    cy.get('[role=status]').should('contain', 'Solicitud recibida');
    salir();

    cy.iniciar('control.escolar@sce.test');
    cy.visit('/tramites');
    fila('2420001', 'Constancia de estudios', 'Recibida').within(() => cy.contains('button', 'Tomar').click());
    fila('2420001', 'Constancia de estudios', 'En proceso').within(() => {
      cy.campo('Motivo del rechazo').type(motivo);
      cy.contains('button', 'Rechazar').click();
    });
    cy.get('[role=status]').should('contain', 'quedó rechazado');
    salir();

    cy.iniciar('alumno@sce.test');
    cy.visit('/mis-tramites');
    fila('Constancia de estudios').should('contain', `Rechazada: ${motivo}`);
    salir();
  });
});
