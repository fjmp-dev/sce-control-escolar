// Demostracion por rol en el ambiente de pruebas (11.3, Tabla 23: autenticacion de los seis roles) y CF-ROL-01 en el portal.
const COMUNES = ['Inicio', 'Facultades', 'Planes de estudio', 'Materias', 'Periodos', 'Mi contraseña'];

const CUENTAS = [
  { cuenta: 'alumno', rol: 'Alumno', altas: [], propios: ['Mi expediente'] },
  { cuenta: 'profesor', rol: 'Profesor', altas: [], propios: [] },
  { cuenta: 'control.escolar', rol: 'Control escolar', altas: [], propios: ['Expedientes'] },
  { cuenta: 'coordinacion', rol: 'Coordinación académica', altas: ['/materias', '/periodos'], propios: [] },
  { cuenta: 'caja', rol: 'Caja', altas: [], propios: [] },
  { cuenta: 'direccion', rol: 'Dirección', altas: [], propios: [] },
  {
    cuenta: 'administrador',
    rol: 'Administrador del sistema',
    altas: ['/facultades', '/planes'],
    propios: ['Usuarios'],
  },
];

describe('Demostracion por rol', () => {
  for (const { cuenta, rol, altas, propios } of CUENTAS) {
    it(`${rol}: inicia sesion, ve solo lo suyo y cierra sesion`, () => {
      const esAdministrador = cuenta === 'administrador';
      cy.iniciar(`${cuenta}@sce.test`);
      cy.contains(rol);
      cy.get('nav a')
        .then((enlaces) => [...enlaces].map((a) => a.textContent))
        .should('deep.equal', ['Inicio', ...propios, ...COMUNES.slice(1)]);
      cy.screenshot(`rol-${cuenta}-inicio`);

      for (const pagina of ['/facultades', '/planes', '/materias', '/periodos']) {
        cy.visit(pagina);
        cy.get('h1');
        cy.contains('button', 'Dar de alta').should(altas.includes(pagina) ? 'exist' : 'not.exist');
      }

      cy.visit('/usuarios');
      if (esAdministrador) {
        cy.contains('h1', 'Usuarios');
      } else {
        cy.location('pathname').should('eq', '/sin-permiso');
        cy.contains('Tu rol no incluye esa función');
      }
      cy.screenshot(`rol-${cuenta}-usuarios`);

      // RF-001: solo control escolar administra expedientes; el alumno solo consulta el suyo.
      cy.visit('/expedientes');
      cy.location('pathname').should('eq', cuenta === 'control.escolar' ? '/expedientes' : '/sin-permiso');
      cy.visit('/mi-expediente');
      cy.location('pathname').should('eq', cuenta === 'alumno' ? '/mi-expediente' : '/sin-permiso');

      cy.contains('button', 'Cerrar sesión').click();
      cy.location('pathname').should('eq', '/ingresar');
    });
  }
});
