// Tabla 23, fase 1: catalogo de usuarios; Parte B de PA-SCE-001: politica de contrasenas y confirmacion del administrador.
import { CONTRASENA } from '../support/e2e';

const CORREO = `persona.${String(Date.now()).slice(-7)}@sce.test`;
const INICIAL = 'inicial-de-prueba-1';
const NUEVA = 'cambiada-de-prueba-2';

describe('Usuarios', () => {
  it('el administrador da de alta, cambia roles y da de baja; la persona cambia su contrasena', () => {
    cy.iniciar('administrador@sce.test');
    cy.visit('/usuarios');

    const alta = (contrasena: string, confirmacion: string) => {
      cy.campo('Correo institucional').clear().type(CORREO);
      cy.campo('Contraseña inicial').clear().type(contrasena, { log: false });
      cy.contains('fieldset', 'Roles').first().contains('label', 'Profesor').find('input').check();
      cy.contains('h2', 'Dar de alta').next('form').contains('label', 'Tu contraseña, para confirmar').click();
      cy.focused().clear().type(confirmacion, { log: false });
      cy.contains('button', 'Dar de alta').click();
    };

    alta('corta', CONTRASENA);
    cy.get('[role=alert]').should('contain', 'al menos 12 caracteres');
    cy.campo('Correo institucional').should('have.value', CORREO);

    alta(INICIAL, 'no-es-la-correcta-1');
    cy.get('[role=alert]').should('contain', 'contraseña de confirmación no es correcta');

    alta(INICIAL, CONTRASENA);
    cy.get('[role=status]').should('contain', `Usuario ${CORREO} creado`);
    cy.contains('tr', CORREO).should('contain', 'Profesor').and('contain', 'Activo');
    cy.screenshot('usuario-creado');

    cy.contains('tr', CORREO).within(() => {
      cy.contains('summary', 'Cambiar acceso').click();
      cy.contains('label', 'Caja').find('input').check();
      cy.contains('label', 'Tu contraseña, para confirmar').click();
      cy.focused().type(CONTRASENA, { log: false });
      cy.contains('button', 'Guardar cambios').click();
    });
    cy.contains('tr', CORREO).should('contain', 'Caja');

    cy.contains('button', 'Cerrar sesión').click();
    cy.iniciar(CORREO, INICIAL);
    cy.contains('Profesor');
    cy.contains('nav a', 'Usuarios').should('not.exist');

    cy.visit('/contrasena');
    cy.campo('Contraseña actual').type(INICIAL, { log: false });
    cy.campo('Contraseña nueva').type('corta', { log: false });
    cy.contains('button', 'Cambiar contraseña').click();
    cy.get('[role=alert]').should('contain', 'al menos 12 caracteres');

    cy.campo('Contraseña actual').clear().type(INICIAL, { log: false });
    cy.campo('Contraseña nueva').clear().type(NUEVA, { log: false });
    cy.contains('button', 'Cambiar contraseña').click();
    cy.location('pathname').should('eq', '/ingresar');
    cy.contains('Tu contraseña cambió');

    cy.iniciar(CORREO, NUEVA);
    cy.contains('button', 'Cerrar sesión').click();

    cy.iniciar('administrador@sce.test');
    cy.visit('/usuarios');
    cy.contains('tr', CORREO).within(() => {
      cy.contains('summary', 'Cambiar acceso').click();
      cy.contains('label', 'Cuenta activa').find('input').uncheck();
      cy.contains('label', 'Tu contraseña, para confirmar').click();
      cy.focused().type(CONTRASENA, { log: false });
      cy.contains('button', 'Guardar cambios').click();
    });
    cy.contains('tr', CORREO).should('contain', 'Inactivo');
    cy.contains('button', 'Cerrar sesión').click();

    cy.visit('/ingresar');
    cy.campo('Correo institucional').type(CORREO);
    cy.campo('Contraseña').type(NUEVA, { log: false });
    cy.contains('button', 'Entrar').click();
    cy.get('[role=alert]').should('contain', 'Correo o contraseña incorrectos');
  });

  it('el administrador no puede cambiar su propia cuenta desde el portal', () => {
    cy.iniciar('administrador@sce.test');
    cy.visit('/usuarios');
    cy.contains('tr', 'administrador@sce.test')
      .should('contain', 'Tu propia cuenta')
      .find('summary')
      .should('not.exist');
  });
});
