// RF-005 sin base de datos: una sola funcion de redondeo (Tabla 16, Precision), D-5, D-8 y D-16 (Batch 8).
// Valores limite y tablas de decision (Tabla 40). CD-DAT-02 repite el calculo en SQL, de forma independiente.
import {
  avance,
  intentos,
  pendientesDeCierre,
  promedio,
  redondear,
  vigentes,
} from '../../src/academico/dominio/calificacion';
import { Historial, IntentoConMateria } from '../../src/expediente/dominio/historial';

describe('R-11: redondear, el unico redondeo, half-up', () => {
  it.each([
    [1, 2, 1, 'la mitad sube'],
    [5, 2, 3, 'la mitad sube tambien en impares'],
    [4, 3, 1, 'un tercio baja'],
    [5, 3, 2, 'dos tercios suben'],
    [0, 7, 0, 'cero'],
    [2450, 3, 817, '8.1666... es 8.17'],
    [2449, 3, 816, '8.1633... es 8.16'],
  ])('%i / %i = %i (%s)', (n, d, esperado) => {
    expect(redondear(n, d)).toBe(esperado);
  });

  it('promedio y avance redondean con la misma funcion', () => {
    expect(promedio([850, 700, 900])).toBe(redondear(2450, 3));
    expect(avance(8, 400)).toBe(redondear(80_000, 400));
  });
});

describe('avance, D-8: porcentaje del plan, con tope', () => {
  it.each([
    [8, 400, 200],
    [1, 3, 3333],
    [2, 3, 6667],
    [400, 400, 10_000],
    [450, 400, 10_000],
    [0, 400, 0],
    [8, 0, 0],
  ])('%i de %i creditos: %i centesimas', (creditos, plan, esperado) => {
    expect(avance(creditos, plan)).toBe(esperado);
  });
});

const fecha = (iso: string) => new Date(iso);
const cursada = (
  folio: string,
  materiaClave: string,
  inicio: string,
  final: number,
  creditos = 8,
  creditosDelPlan = 400,
): IntentoConMateria => ({ folio, materiaClave, inicioDelPeriodo: fecha(inicio), final, creditos, creditosDelPlan });

describe('intentos y vigentes, D-5', () => {
  it('la final de un intento es el promedio de sus parciales; si se recursa, cuenta el ultimo', () => {
    const lista = intentos([
      { folio: 'A', materiaClave: 'M1', inicioDelPeriodo: fecha('2026-01-01'), centesimas: 500 },
      { folio: 'A', materiaClave: 'M1', inicioDelPeriodo: fecha('2026-01-01'), centesimas: 550 },
      { folio: 'B', materiaClave: 'M1', inicioDelPeriodo: fecha('2026-08-01'), centesimas: 900 },
    ]);
    expect(lista.map((i) => [i.folio, i.final])).toEqual([
      ['A', 525],
      ['B', 900],
    ]);
    expect(vigentes(lista).get('M1')?.folio).toBe('B');
  });
});

describe('R-12 y R-13: Historial.recalcular, RF-005', () => {
  it('sin calificaciones cerradas, todo en cero', () => {
    expect(Historial.recalcular([])).toEqual(new Historial(0, 0, 0));
  });

  it('el caso del seed: 8.17 en una materia de 8 creditos de un plan de 400', () => {
    expect(Historial.recalcular([cursada('A', 'ISW-101', '2026-01-26', 817)])).toEqual(new Historial(817, 8, 200));
  });

  it('una reprobada cuenta en el promedio pero no da creditos; la minima es 6.00', () => {
    const h = Historial.recalcular([cursada('A', 'M1', '2026-01-01', 599), cursada('A', 'M2', '2026-01-01', 600, 6)]);
    expect(h).toEqual(new Historial(redondear(599 + 600, 2), 6, 150));
  });

  it('recursada: solo cuenta el ultimo intento, aunque el primero fuera mejor', () => {
    const h = Historial.recalcular([
      cursada('A', 'M1', '2026-01-01', 900),
      cursada('B', 'M1', '2026-08-01', 500),
      cursada('B', 'M2', '2026-08-01', 1000),
    ]);
    expect(h.promedio).toBe(750);
    expect(h.creditosAcumulados).toBe(8);
  });

  it('D-8: el avance es contra el plan de la materia cursada mas reciente', () => {
    const h = Historial.recalcular([
      cursada('A', 'M1', '2026-01-01', 800, 8, 400),
      cursada('B', 'M2', '2026-08-01', 800, 8, 200),
    ]);
    expect(h.avance).toBe(800);
  });

  it('se recalcula completo: el mismo resultado sin importar el orden', () => {
    const lista = [cursada('A', 'M1', '2026-01-01', 700), cursada('B', 'M2', '2026-08-01', 950)];
    expect(Historial.recalcular(lista)).toEqual(Historial.recalcular([...lista].reverse()));
  });
});

describe('pendientesDeCierre, D-16: tabla de decision', () => {
  const grupo = (parciales: [string, number[]][]) => ({
    grupoClave: 'G-1',
    materiaNombre: 'Bases de datos',
    parcialesPorFolio: new Map(parciales),
  });

  it.each([
    [
      'todos con los mismos parciales',
      [
        ['A', [1, 2]],
        ['B', [1, 2]],
      ],
      [],
    ],
    [
      'a uno le falta un parcial',
      [
        ['A', [1, 2]],
        ['B', [1]],
      ],
      [1],
    ],
    [
      'nadie tiene calificaciones',
      [
        ['A', []],
        ['B', []],
      ],
      [2],
    ],
    [
      'uno sin calificaciones y otro con dos',
      [
        ['A', [1, 2]],
        ['B', []],
      ],
      [2],
    ],
    ['grupo sin inscritos', [], []],
  ] as [string, [string, number[]][], number[]][])('%s', (_, parciales, faltan) => {
    expect(pendientesDeCierre([grupo(parciales)]).map((p) => p.faltan)).toEqual(faltan);
  });

  it('nombra la materia y el grupo', () => {
    expect(pendientesDeCierre([grupo([['A', []]])])).toEqual([{ grupo: 'Bases de datos (grupo G-1)', faltan: 1 }]);
  });
});
