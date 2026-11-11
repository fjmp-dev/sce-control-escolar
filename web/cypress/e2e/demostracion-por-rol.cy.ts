// Demostracion por rol en el ambiente de pruebas (11.3, Tabla 23: autenticacion de los seis roles) y CF-ROL-01 en el portal.
// CO-ACC-01 (12.4): axe sobre el inicio de cada uno de los siete roles.
const COMUNES = ['Inicio', 'Facultades', 'Planes de estudio', 'Materias', 'Periodos', 'Mi contraseña'];

const CUENTAS = [
  {
    cuenta: 'alumno',
    rol: 'Alumno',
    altas: [],
    propios: ['Inscripción', 'Mi horario', 'Mis calificaciones', 'Mi expediente', 'Mi cuenta', 'Mis trámites'],
  },
  { cuenta: 'profesor', rol: 'Profesor', altas: [], propios: ['Mis grupos'] },
  { cuenta: 'control.escolar', rol: 'Control escolar', altas: [], propios: ['Expedientes', 'Trámites'] },
  {
    cuenta: 'coordinacion',
    rol: 'Coordinación académica',
    altas: ['/materias', '/periodos'],
    propios: ['Oferta', 'Correcciones'],
  },
  { cuenta: 'caja', rol: 'Caja', altas: [], propios: ['Caja'] },
  { cuenta: 'direccion', rol: 'Dirección', altas: [], propios: ['Reportes'] },
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
      cy.revisarAxe(`inicio-${cuenta.replace('.', '-')}`); // 28.2: la página de inicio de cada rol

      for (const pagina of ['/facultades', '/planes', '/materias', '/periodos']) {
        cy.visit(pagina);
        cy.get('h1');
        const boton = pagina === '/periodos' ? 'Abrir periodo' : 'Dar de alta';
        cy.contains('button', boton).should(altas.includes(pagina) ? 'exist' : 'not.exist');
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
      // RF-002: solo el alumno se inscribe.
      cy.visit('/inscripcion');
      cy.location('pathname').should('eq', cuenta === 'alumno' ? '/inscripcion' : '/sin-permiso');
      // RF-003 y RF-004: consulta diferenciada por rol (Tabla 4).
      for (const [pagina, duena] of [
        ['/oferta', 'coordinacion'],
        ['/mis-grupos', 'profesor'],
        ['/mi-horario', 'alumno'],
        ['/mis-calificaciones', 'alumno'],
        ['/correcciones', 'coordinacion'],
      ]) {
        cy.visit(pagina);
        cy.location('pathname').should('eq', cuenta === duena ? pagina : '/sin-permiso');
      }

      cy.contains('button', 'Cerrar sesión').click();
      cy.location('pathname').should('eq', '/ingresar');
    });
  }
});
