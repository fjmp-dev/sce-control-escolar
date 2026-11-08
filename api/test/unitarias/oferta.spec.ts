// CF-HOR-01 (Tabla 43, Jest) y RK-05: valores limite del traslape y cupo, sin base de datos (Tabla 40).
import { choquesEntre, describirChoque, Grupo, Horario } from '../../src/academico/dominio/oferta';

const lunes = (inicio: string, fin: string) => new Horario(1, inicio, fin, 'A1');
const grupo = (id: number, horarios: Horario[], cupo = 30, ocupacion = 0) =>
  new Grupo({
    id,
    clave: `G${id}`,
    materiaClave: `M${id}`,
    materiaNombre: `Materia ${id}`,
    creditos: 8,
    cupo,
    ocupacion,
    horarios,
  });

describe('Horario.traslapaCon', () => {
  it.each([
    ['07:00', '09:00', '08:00', '10:00', true, 'se cruzan'],
    ['07:00', '09:00', '07:00', '09:00', true, 'son iguales'],
    ['07:00', '11:00', '08:00', '09:00', true, 'uno contiene al otro'],
    ['07:00', '09:00', '08:59', '10:00', true, 'se cruzan por un minuto'],
    ['07:00', '09:00', '09:00', '11:00', false, 'uno termina cuando empieza el otro'],
    ['09:00', '11:00', '07:00', '09:00', false, 'el orden no importa'],
    ['07:00', '08:00', '10:00', '11:00', false, 'estan separados'],
  ])('%s-%s y %s-%s: %s (%s)', (a1, a2, b1, b2, esperado) => {
    expect(lunes(a1, a2).traslapaCon(lunes(b1, b2))).toBe(esperado);
    expect(lunes(b1, b2).traslapaCon(lunes(a1, a2))).toBe(esperado);
  });

  it('a la misma hora en dias distintos no chocan', () => {
    expect(lunes('07:00', '09:00').traslapaCon(new Horario(2, '07:00', '09:00', 'A1'))).toBe(false);
  });
});

describe('choquesEntre', () => {
  it('encuentra el tramo en comun entre grupos de varios horarios y lo describe', () => {
    const a = grupo(1, [lunes('07:00', '09:00'), new Horario(3, '07:00', '09:00', 'A1')]);
    const b = grupo(2, [lunes('08:00', '10:00')]);
    const c = grupo(3, [new Horario(5, '07:00', '09:00', 'A1')]);
    const choques = choquesEntre([a, b, c]);
    expect(choques.map(({ a, b, dia, desde, hasta }) => [a.id, b.id, dia, desde, hasta])).toEqual([
      [1, 2, 1, '08:00', '09:00'],
    ]);
    expect(describirChoque(choques[0])).toBe(
      'Materia 1 (grupo G1) y Materia 2 (grupo G2) se traslapan el lunes de 08:00 a 09:00',
    );
  });

  it('una carga sin traslapes no tiene choques', () => {
    expect(choquesEntre([grupo(1, [lunes('07:00', '09:00')]), grupo(2, [lunes('09:00', '11:00')])])).toEqual([]);
  });
});

describe('Grupo.hayCupo, valores limite', () => {
  it.each([
    [30, 29, true],
    [30, 30, false],
    [1, 0, true],
    [1, 1, false],
  ])('cupo %i con ocupacion %i: %s', (cupo, ocupacion, esperado) => {
    expect(grupo(1, [], cupo, ocupacion).hayCupo()).toBe(esperado);
  });
});
