// RF-001 (Fig. 3): transicion de estados y cambio de plantel, sin base de datos (Tabla 40).
import { Alumno, ESTATUS, type Estatus } from '../../src/expediente/dominio/alumno';

const alumno = (estatus: Estatus = 'activo') => new Alumno('2420001', 'CUTG', estatus);
const codigo = (accion: () => unknown) => {
  try {
    accion();
    return null;
  } catch (e) {
    return (e as { codigo: string }).codigo;
  }
};

describe('Alumno.cambiarFacultad', () => {
  it('el mismo expediente cambia de facultad: misma matricula, mismo estatus', () => {
    expect(alumno().cambiarFacultad('FSD')).toEqual(new Alumno('2420001', 'FSD', 'activo'));
  });

  it('no cambia a la facultad en la que ya esta', () => {
    expect(codigo(() => alumno().cambiarFacultad('CUTG'))).toBe('SIN_CAMBIO');
  });

  it.each(['baja', 'egresado'] as const)('un expediente en %s no cambia de plantel', (estatus) => {
    expect(codigo(() => alumno(estatus).cambiarFacultad('FSD'))).toBe('EXPEDIENTE_NO_ACTIVO');
  });
});

describe('Alumno.cambiarEstatus: tabla completa de transiciones', () => {
  const PERMITIDAS = new Set(['activo>baja', 'activo>egresado', 'baja>activo']);
  const casos = ESTATUS.flatMap((desde) => ESTATUS.map((hacia) => [desde, hacia] as const));

  it.each(casos)('%s -> %s', (desde, hacia) => {
    const resultado = codigo(() => alumno(desde).cambiarEstatus(hacia));
    expect(resultado).toBe(PERMITIDAS.has(`${desde}>${hacia}`) ? null : 'TRANSICION_INVALIDA');
  });

  it('el egreso es definitivo y lo explica', () => {
    expect(() => alumno('egresado').cambiarEstatus('activo')).toThrow('definitivo');
  });
});
