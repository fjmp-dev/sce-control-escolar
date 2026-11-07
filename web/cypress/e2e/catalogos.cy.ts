// Tabla 23, fase 1: catalogos de facultades, periodos, planes y materias, con errores de negocio de la API (Tabla 44).
const SUFIJO = String(Date.now()).slice(-7);
const FACULTAD = `F${SUFIJO}`;
const PLAN = `P${SUFIJO}`;
const MATERIA_A = `A${SUFIJO}`;
const MATERIA_B = `B${SUFIJO}`;
const PERIODO = `${2030 + (Number(SUFIJO) % 900)}A`;

const enviar = (boton: string) => cy.contains('button', boton).click();

describe('Catalogos', () => {
  it('el administrador da de alta facultades y planes', () => {
    cy.iniciar('administrador@sce.test');
    cy.visit('/facultades');
    enviar('Dar de alta');
    cy.get('[role=alert]').should('contain', 'Revisa los campos marcados');
    cy.contains('Usa solo letras, números y guion');

    cy.campo('Clave').type(`${FACULTAD}/mal`);
    cy.campo('Nombre').type('Facultad de prueba');
    enviar('Dar de alta');
    cy.campo('Clave').should('have.attr', 'aria-invalid', 'true').and('have.value', `${FACULTAD}/mal`);
    cy.campo('Nombre').should('have.value', 'Facultad de prueba');

    cy.campo('Clave').clear().type(FACULTAD);
    enviar('Dar de alta');
    cy.get('[role=status]').should('contain', `Facultad ${FACULTAD} creada`);
    cy.contains('td', FACULTAD);
    cy.screenshot('facultad-creada');

    cy.campo('Clave').type(FACULTAD);
    cy.campo('Nombre').type('Repetida');
    enviar('Dar de alta');
    cy.get('[role=alert]').should('contain', 'Ya existe un registro');

    cy.visit('/planes');
    cy.campo('Clave').type(PLAN);
    cy.campo('Facultad').select(FACULTAD);
    cy.campo('Créditos totales').type('300');
    cy.campo('Vigente desde').type('2030-01-15');
    enviar('Dar de alta');
    cy.get('[role=status]').should('contain', `Plan ${PLAN} creado`);
    cy.contains('tr', PLAN).should('contain', FACULTAD).and('contain', '300').and('contain', '2030');
  });

  it('coordinacion da de alta materias, prerrequisitos y periodos; el ciclo se rechaza con causa', () => {
    cy.iniciar('coordinacion@sce.test');
    cy.visit('/materias');
    for (const clave of [MATERIA_A, MATERIA_B]) {
      cy.campo('Clave').type(clave);
      cy.campo('Plan de estudios').select('ISW-2024');
      cy.campo('Nombre').type(`Materia ${clave}`);
      cy.campo('Créditos').type('6');
      enviar('Dar de alta');
      cy.get('[role=status]').should('contain', `Materia ${clave} creada`);
    }

    const agregar = (materia: string, requiere: string) => {
      cy.visit('/materias');
      cy.campo('Materia').select(materia);
      cy.campo('Requiere haber cursado').select(requiere);
      enviar('Agregar prerrequisito');
    };
    agregar(MATERIA_B, MATERIA_A);
    cy.get('[role=status]').should('contain', `${MATERIA_B} ahora requiere ${MATERIA_A}`);
    cy.contains('tr', MATERIA_B).should('contain', `${MATERIA_A} (obligatorio)`);
    cy.screenshot('prerrequisito-agregado');

    agregar(MATERIA_A, MATERIA_B);
    cy.get('[role=alert]').should('contain', `${MATERIA_B} ya depende de ${MATERIA_A}`);

    cy.campo('Prerrequisito a quitar').select(`${MATERIA_B}|${MATERIA_A}`);
    enviar('Quitar prerrequisito');
    cy.get('[role=status]').should('contain', `${MATERIA_B} ya no requiere ${MATERIA_A}`);
    cy.contains('tr', MATERIA_B).should('contain', 'Ninguno');

    cy.visit('/periodos');
    cy.campo('Clave').type(PERIODO);
    cy.campo('Fecha de inicio').type('2030-06-30');
    cy.campo('Fecha de fin').type('2030-01-10');
    cy.campo('Estado').select('Abierto');
    enviar('Dar de alta');
    cy.get('[role=alert]').should('contain', 'Revisa los datos');
    cy.campo('Clave').should('have.value', PERIODO);
    cy.campo('Estado').should('have.value', 'abierto');

    cy.campo('Fecha de inicio').clear().type('2030-01-10');
    cy.campo('Fecha de fin').clear().type('2030-06-30');
    enviar('Dar de alta');
    cy.get('[role=status]').should('contain', `Periodo ${PERIODO} creado`);
    cy.contains('tr', PERIODO).should('contain', 'Abierto');
    cy.screenshot('periodo-creado');
  });
});
