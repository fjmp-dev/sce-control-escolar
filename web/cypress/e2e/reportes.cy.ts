// CF-REP-01 en el portal (Batch 10, RF-009): direccion consulta los agregados por periodo; otro rol no entra.
// Otras specs crean periodos en la misma base, asi que no se supone cual es el mas reciente.
describe('Reportes de direccion (RF-009)', () => {
  it('direccion ve inscripcion, avance y cobranza por facultad y de la universidad', () => {
    cy.iniciar('direccion@sce.test');
    cy.contains('nav a', 'Reportes').click();
    cy.contains('h1', 'Reportes');
    cy.get('#periodo').select('2026B');
    cy.contains('button', 'Consultar').click();
    cy.location('search').should('eq', '?periodo=2026B');
    for (const tabla of ['Inscripción en 2026B', 'Avance académico', 'Cobranza']) {
      cy.contains('caption', tabla).parent('table').find('tbody tr').last().should('contain', 'Universidad');
    }
    cy.revisarAxe('direccion-reportes');
  });

  it('otro rol no ve los reportes', () => {
    cy.iniciar('alumno@sce.test');
    cy.visit('/reportes');
    cy.location('pathname').should('eq', '/sin-permiso');
  });
});
