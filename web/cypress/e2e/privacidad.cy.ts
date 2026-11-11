// PA-SCE-001, Parte B (AU-18) y 28.2: el aviso de privacidad se consulta sin sesión, desde el inicio de sesión, y pasa axe.
describe('Aviso de privacidad', () => {
  it('sin sesión se abre desde iniciar sesión, dice que es un modelo y pasa axe', () => {
    cy.visit('/ingresar');
    cy.contains('a', 'Aviso de privacidad').click();
    cy.location('pathname').should('eq', '/privacidad');
    cy.contains('h1', 'Aviso de privacidad simplificado');
    cy.get('[role=status]').should('contain', 'Modelo no oficial');
    cy.getCookie('sce_sesion').should('be.null');
    cy.revisarAxe('privacidad');
    cy.contains('a', 'Ir a iniciar sesión').click();
    cy.location('pathname').should('eq', '/ingresar');
  });

  it('entrando directo tampoco pide sesión, y no se desborda en celular ni con zoom de 200 %', () => {
    for (const [ancho, alto] of [
      [390, 844],
      [683, 384],
    ]) {
      cy.viewport(ancho, alto);
      cy.visit('/privacidad');
      cy.location('pathname').should('eq', '/privacidad');
      cy.get('h1');
      cy.document().then((documento) => {
        const raiz = documento.documentElement;
        expect(raiz.scrollWidth, `desborde horizontal en ${ancho}x${alto}`).to.be.at.most(raiz.clientWidth);
      });
      cy.revisarAxe(`privacidad-${ancho}x${alto}`);
    }
  });
});
