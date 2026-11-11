// RF-002 y RNF-USU-001 (Fig. 4 y 6, CC-017): tabla de decision, transiciones y orden fijo, sin base de datos (Tabla 40).
import { explicarRechazo, Inscripcion, type EstadoInscripcion } from '../../src/expediente/dominio/inscripcion';

const CARGA = [
  { id: 7, materiaClave: 'ISW-201' },
  { id: 3, materiaClave: 'ISW-701' },
];
const codigo = (accion: () => unknown) => {
  try {
    accion();
    return null;
  } catch (e) {
    return (e as { codigo?: string }).codigo ?? (e as Error).message;
  }
};
const enviada = () => {
  const i = Inscripcion.nueva('INS-2027A-2420001');
  i.enviar(CARGA);
  return i;
};
const confirmada = () => {
  const i = enviada();
  i.validarPrerrequisitos([]);
  i.validarAdeudos(false);
  i.validarChoques([]);
  i.confirmar();
  return i;
};
const validar = (i: Inscripcion, faltante: boolean, adeudo: boolean, choque: boolean) =>
  i.validarPrerrequisitos(faltante ? ['falta'] : []) &&
  i.validarAdeudos(adeudo) &&
  i.validarChoques(choque ? ['x'] : []);

describe('R-07 y R-08, tabla de decision: el primer fallo en el orden de la Fig. 4 decide el motivo', () => {
  it.each([
    [false, false, false, 'confirmada', null],
    [true, false, false, 'rechazada', 'prerrequisito'],
    [false, true, false, 'rechazada', 'adeudo'],
    [false, false, true, 'rechazada', 'choque'],
    [true, true, false, 'rechazada', 'prerrequisito'],
    [true, false, true, 'rechazada', 'prerrequisito'],
    [false, true, true, 'rechazada', 'adeudo'],
    [true, true, true, 'rechazada', 'prerrequisito'],
  ])('faltante %s, adeudo %s, choque %s: %s por %s', (faltante, adeudo, choque, estado, motivo) => {
    const i = enviada();
    if (validar(i, faltante, adeudo, choque)) i.confirmar();
    expect([i.estado, i.motivo]).toEqual([estado, motivo]);
  });
});

describe('Fig. 4 y 13.1: nadie confirma sin las tres validaciones, en su orden', () => {
  it('confirmar sin validar es un error de programacion', () => {
    expect(codigo(() => enviada().confirmar())).toMatch(/ninguna inscripción se confirma/);
  });

  it('validar adeudos antes que prerrequisitos es un error de programacion', () => {
    expect(codigo(() => enviada().validarAdeudos(false))).toMatch(/orden fijo/);
  });

  it('no se valida una inscripcion que no esta en validacion', () => {
    expect(codigo(() => Inscripcion.nueva('F').validarPrerrequisitos([]))).toMatch(/no está en validación/);
  });
});

describe('Fig. 6: transiciones', () => {
  it('Borrador → EnValidacion con la carga ordenada', () => {
    const i = enviada();
    expect([i.estado, i.grupos]).toEqual(['en_validacion', [3, 7]]);
  });

  it('Rechazada → Borrador al corregir, y de nuevo a validacion con la carga nueva', () => {
    const i = new Inscripcion('F', 'rechazada', 'adeudo', [3]);
    i.enviar([{ id: 9, materiaClave: 'ISW-702' }]);
    expect([i.estado, i.motivo, i.grupos]).toEqual(['en_validacion', null, [9]]);
  });

  it('el cupo se agota tras validar: termina rechazada por cupo', () => {
    const i = enviada();
    validar(i, false, false, false);
    i.rechazar('cupo');
    expect([i.estado, i.motivo]).toEqual(['rechazada', 'cupo']);
  });

  it('Confirmada → Ajustada → Confirmada al revalidar, con la carga nueva', () => {
    const i = confirmada();
    i.ajustar([{ id: 3, materiaClave: 'ISW-701' }]);
    expect(i.estado).toBe('ajustada');
    validar(i, false, false, false);
    i.confirmar();
    expect([i.estado, i.grupos]).toEqual(['confirmada', [3]]);
  });

  it('un ajuste que no pasa vuelve a Confirmada con la carga anterior y recuerda el motivo', () => {
    const i = confirmada();
    i.ajustar([{ id: 3, materiaClave: 'ISW-701' }]);
    validar(i, false, false, true);
    expect([i.estado, i.motivo, i.grupos, i.ultimoRechazo]).toEqual(['confirmada', null, [3, 7], 'choque']);
  });

  it('Confirmada → Cerrada con el cierre del periodo', () => {
    const i = confirmada();
    i.cerrar();
    expect(i.estado).toBe('cerrada');
  });

  it.each<[EstadoInscripcion, string]>([
    ['confirmada', 'ajústala'],
    ['cerrada', 'cerrada'],
    ['ajustada', 'no admite'],
  ])('no se envia otra carga sobre una inscripcion %s', (estado, texto) => {
    const i = new Inscripcion('F', estado, null, [1]);
    expect(codigo(() => i.enviar(CARGA))).toBe('TRANSICION_INVALIDA');
    expect(() => i.enviar(CARGA)).toThrow(texto);
  });

  it.each<EstadoInscripcion>(['rechazada', 'cerrada', 'borrador'])('no se ajusta una inscripcion %s', (estado) => {
    expect(codigo(() => new Inscripcion('F', estado, null, [1]).ajustar(CARGA))).toBe('TRANSICION_INVALIDA');
  });

  it.each<EstadoInscripcion>(['rechazada', 'borrador'])('no se cierra una inscripcion %s', (estado) => {
    expect(codigo(() => new Inscripcion('F', estado, null, [1]).cerrar())).toBe('TRANSICION_INVALIDA');
  });
});

describe('Fig. 3: la carga', () => {
  it('tiene al menos un grupo', () => {
    expect(codigo(() => Inscripcion.nueva('F').enviar([]))).toBe('CARGA_VACIA');
  });

  it('no lleva dos grupos de la misma materia', () => {
    const repetida = [...CARGA, { id: 8, materiaClave: 'ISW-201' }];
    expect(codigo(() => Inscripcion.nueva('F').enviar(repetida))).toBe('MATERIA_REPETIDA');
  });

  it('un ajuste sin cambios se rechaza', () => {
    expect(codigo(() => confirmada().ajustar([...CARGA].reverse()))).toBe('SIN_CAMBIO');
  });
});

describe('RNF-USU-001: el mensaje dice la causa y la correccion', () => {
  it.each([
    ['prerrequisito', 'Quita esa materia'],
    ['adeudo', 'Consulta tu estado de cuenta en caja'],
    ['choque', 'Cambia uno de los dos grupos'],
    ['cupo', 'Elige otro grupo'],
  ] as const)('%s', (motivo, correccion) => {
    expect(explicarRechazo(motivo, ['Causa uno', 'Causa dos'])).toMatch(
      new RegExp(`^Causa uno. Causa dos. ${correccion}`),
    );
  });
});
