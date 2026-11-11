// Dominio de identidad, sin base de datos (14.1-8). Tecnicas: particiones y valores limite (Tabla 40).
import { ErrorDeNegocio } from '../../src/dominio/error-de-negocio';
import { estaBloqueado, MAX_FALLOS, Sesion, Usuario, validarContrasena } from '../../src/identidad/dominio/usuario';

const AHORA = 1_000_000;
const LIMITES = { normalSeg: 3600, privilegiadaSeg: 900, maximaSeg: 28_800 };
const usuario = (activo = true, roles: Usuario['roles'] = ['alumno']) =>
  new Usuario('u1', 'ana@sce.test', 'h', activo, 3, roles);

const codigoDe = (accion: () => unknown) => {
  try {
    accion();
  } catch (e) {
    return (e as ErrorDeNegocio).codigo;
  }
  return null;
};

describe('Usuario.autenticar (Fig. 3, RF-008)', () => {
  it('con contrasena correcta abre sesion con la version vigente', () => {
    const sesion = usuario().autenticar(true, 0, AHORA);
    expect(sesion).toEqual(new Sesion('u1', 3, AHORA));
  });

  it.each([
    ['contrasena incorrecta', usuario(), false, 0],
    ['cuenta inactiva', usuario(false), true, 0],
    ['cuenta bloqueada, aun con la contrasena correcta', usuario(), true, MAX_FALLOS],
  ])('rechaza con el mismo error: %s', (_, u, correcta, fallos) => {
    expect(codigoDe(() => u.autenticar(correcta, fallos, AHORA))).toBe('CREDENCIALES_INVALIDAS');
  });

  it('valores limite del bloqueo: un fallo antes del maximo aun entra', () => {
    expect(estaBloqueado(MAX_FALLOS - 1)).toBe(false);
    expect(estaBloqueado(MAX_FALLOS)).toBe(true);
    expect(usuario().autenticar(true, MAX_FALLOS - 1, AHORA)).toBeInstanceOf(Sesion);
  });

  it('solo el administrador es privilegiado', () => {
    expect(usuario(true, ['administrador']).privilegiado).toBe(true);
    expect(
      usuario(true, ['alumno', 'profesor', 'control_escolar', 'coordinacion', 'caja', 'direccion']).privilegiado,
    ).toBe(false);
  });
});

describe('Sesion.segundosDeVida (Tabla 38, renovacion controlada)', () => {
  const sesion = new Sesion('u1', 3, AHORA);

  it('el rol privilegiado dura menos', () => {
    expect(sesion.segundosDeVida(false, AHORA, LIMITES)).toBe(3600);
    expect(sesion.segundosDeVida(true, AHORA, LIMITES)).toBe(900);
  });

  it('ningun token rebasa la sesion maxima', () => {
    expect(sesion.segundosDeVida(false, AHORA + LIMITES.maximaSeg - 10, LIMITES)).toBe(10);
  });

  it.each([0, 1])('al llegar a la sesion maxima ya no renueva (+%i s)', (extra) => {
    expect(codigoDe(() => sesion.segundosDeVida(false, AHORA + LIMITES.maximaSeg + extra, LIMITES))).toBe(
      'SESION_VENCIDA',
    );
  });
});

describe('validarContrasena (Parte B de PA-SCE-001)', () => {
  it.each(['contrasena-larga-1', 'ñandú con 12 letras', 'a1b2c3d4e5f6'])('acepta %s', (c) => {
    expect(codigoDe(() => validarContrasena(c, 'ana@sce.test'))).toBeNull();
  });

  it.each([
    ['11 caracteres', 'abcdefghi12'],
    ['mas de 72 bytes', `a1${'ñ'.repeat(36)}`],
    ['sin numeros', 'solo-letras-largas'],
    ['sin letras', '123456789012'],
    ['pocos caracteres distintos', 'aaaa1111aaaa1111'],
    ['contiene el correo', 'xAna1234567890'],
  ])('rechaza: %s', (_, c) => {
    expect(codigoDe(() => validarContrasena(c, 'ana@sce.test'))).toBe('CONTRASENA_DEBIL');
  });

  it('valor limite: exactamente 12 caracteres y 72 bytes pasan', () => {
    expect(codigoDe(() => validarContrasena('abcdefghij12', 'ana@sce.test'))).toBeNull();
    expect(codigoDe(() => validarContrasena(`a1${'bcdefgh'.repeat(10)}`, 'ana@sce.test'))).toBeNull();
  });
});
