// D-5 (provisional) y R-03: promedio half-up en enteros, ultimo intento y valores limite de la aprobatoria.
import { aCentesimas, materiasAcreditadas, promedio } from '../../src/academico/dominio/calificacion';
import { describirFaltante, faltantes } from '../../src/academico/dominio/prerequisito';
import { CuentaAlumno } from '../../src/pagos/dominio/cuenta-alumno';

describe('R-11: promedio, una sola funcion de redondeo (Tabla 16)', () => {
  it.each([
    [[850, 700, 900], 817, '8.1666 baja'],
    [[600, 599], 600, '5.995 sube por half-up'],
    [[599, 598], 599, '5.985 sube a 5.99'],
    [[1000], 1000, 'un solo parcial'],
    [[], 0, 'sin parciales'],
  ])('%j -> %i (%s)', (valores, esperado) => {
    expect(promedio(valores)).toBe(esperado);
  });

  it('pasa a centesimas sin errores de punto flotante', () => {
    expect([aCentesimas(8.17), aCentesimas(0.1 + 0.2), aCentesimas(5.99)]).toEqual([817, 30, 599]);
  });
});

describe('materiasAcreditadas', () => {
  const cal = (folio: string, materiaClave: string, inicio: string, centesimas: number) => ({
    folio,
    materiaClave,
    inicioDelPeriodo: new Date(inicio),
    centesimas,
  });

  it('valores limite de la aprobatoria de 6.00, ya redondeada', () => {
    const acreditadas = materiasAcreditadas([
      cal('F1', 'JUSTA', '2026-08-01', 600),
      cal('F1', 'REDONDEA', '2026-08-01', 600),
      cal('F1', 'REDONDEA', '2026-08-01', 599),
      cal('F1', 'NO', '2026-08-01', 599),
    ]);
    expect([...acreditadas].sort()).toEqual(['JUSTA', 'REDONDEA']);
  });

  it('si se recursa, cuenta el ultimo intento aunque el anterior fuera aprobado', () => {
    expect(
      materiasAcreditadas([
        cal('F1', 'A', '2025-08-01', 500),
        cal('F2', 'A', '2026-01-10', 800),
        cal('F1', 'B', '2025-08-01', 900),
        cal('F2', 'B', '2026-01-10', 400),
      ]),
    ).toEqual(new Set(['A']));
  });
});

describe('faltantes: solo los prerrequisitos obligatorios no acreditados (R-03)', () => {
  const requisito = (requiereClave: string, obligatorio = true) => ({
    materiaClave: 'ISW-301',
    materiaNombre: 'Bases de datos',
    requiereClave,
    requiereNombre: `Materia ${requiereClave}`,
    obligatorio,
  });

  it('excluye los acreditados y los no obligatorios', () => {
    const lista = faltantes([requisito('A'), requisito('B'), requisito('C', false)], new Set(['A']));
    expect(lista.map((r) => r.requiereClave)).toEqual(['B']);
    expect(describirFaltante(lista[0])).toBe(
      'Te falta acreditar Materia B (B) para inscribir Bases de datos (ISW-301)',
    );
  });
});

describe('CuentaAlumno.tieneAdeudo, D-10: saldo mayor que cero', () => {
  it.each([
    [0.01, true],
    [0, false],
    [-50, false],
  ])('saldo %d: %s', (saldo, esperado) => {
    expect(new CuentaAlumno(saldo).tieneAdeudo()).toBe(esperado);
  });
});
