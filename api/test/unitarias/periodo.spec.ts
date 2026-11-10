// Fig. 3, Periodo (Batch 7): abrir, publicar la oferta (CC-012) y la regla de inscripcion (D-6), sin base de datos.
import { ErrorDeNegocio } from '../../src/dominio/error-de-negocio';
import { EstadoPeriodo, Periodo } from '../../src/academico/dominio/periodo';

const inicio = new Date('2027-01-12');
const fin = new Date('2027-06-30');
const periodo = (estado: EstadoPeriodo, publicada: Date | null = null) =>
  new Periodo('2027A', inicio, fin, estado, publicada);
const codigo = (accion: () => unknown) => {
  try {
    accion();
  } catch (error) {
    return (error as ErrorDeNegocio).codigo;
  }
  return undefined;
};

describe('Periodo.abrir', () => {
  it('nace abierto y sin oferta publicada', () => {
    expect(Periodo.abrir('2027A', inicio, fin)).toEqual(periodo('abierto'));
  });

  it.each([
    ['el fin antes del inicio', fin, inicio],
    ['el mismo dia', inicio, inicio],
  ])('rechaza %s', (_, desde, hasta) => {
    expect(codigo(() => Periodo.abrir('2027A', desde, hasta))).toBe('RANGO_INVERTIDO');
  });
});

describe('Periodo.publicarOferta', () => {
  const ahora = new Date('2026-12-01T15:00:00Z');

  it('guarda el momento de la publicacion sin cambiar el estado', () => {
    expect(periodo('abierto').publicarOferta(ahora)).toEqual(periodo('abierto', ahora));
  });

  it.each([
    ['ya publicada', periodo('abierto', ahora), 'OFERTA_YA_PUBLICADA'],
    ['en curso', periodo('en_curso'), 'PERIODO_NO_ABIERTO'],
    ['cerrado', periodo('cerrado'), 'PERIODO_NO_ABIERTO'],
  ])('rechaza un periodo %s', (_, p, esperado) => {
    expect(codigo(() => p.publicarOferta(ahora))).toBe(esperado);
  });
});

describe('Inscripcion abierta: tabla de decision de estado y publicacion (D-6, CC-012)', () => {
  const publicada = new Date('2026-12-01T15:00:00Z');
  it.each([
    ['abierto', publicada, undefined],
    ['abierto', null, 'OFERTA_NO_PUBLICADA'],
    ['en_curso', publicada, 'PERIODO_NO_ABIERTO'],
    ['cerrado', publicada, 'PERIODO_NO_ABIERTO'],
    ['cerrado', null, 'PERIODO_NO_ABIERTO'],
  ] as const)('%s con oferta %s: %s', (estado, fecha, esperado) => {
    expect(codigo(() => periodo(estado, fecha).exigirInscripcionAbierta())).toBe(esperado);
  });

  it('la oferta solo se define con el periodo abierto', () => {
    expect(codigo(() => periodo('abierto', publicada).exigirAbierto())).toBeUndefined();
    expect(codigo(() => periodo('en_curso').exigirAbierto())).toBe('PERIODO_NO_ABIERTO');
  });
});
