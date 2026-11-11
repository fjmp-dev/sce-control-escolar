// RF-009 sin base de datos: medias y porcentajes con el unico redondeo del sistema, y bases en cero.
import { indicadores, media, porcentaje, Totales } from '../../src/reportes/dominio/indicadores';

const VACIA: Totales = {
  facultadClave: null,
  facultadNombre: null,
  activos: 0,
  inscritos: 0,
  conHistorial: 0,
  sumaPromedios: 0,
  sumaAvance: 0,
  cargos: 0,
  pagado: 0,
  becas: 0,
  pendiente: 0,
  conAdeudo: 0,
};

describe('Indicadores de reportes', () => {
  it('media y porcentaje redondean half-up a dos decimales', () => {
    expect(media(1575, 2)).toBe(7.88);
    expect(media(1574, 2)).toBe(7.87);
    expect(porcentaje(1, 3)).toBe(33.33);
    expect(porcentaje(2, 3)).toBe(66.67);
    expect(porcentaje(110_000, 150_000)).toBe(73.33);
  });

  it('sin base no divide entre cero', () => {
    expect(media(0, 0)).toBe(0);
    expect(porcentaje(5, 0)).toBe(0);
  });

  it('la fila sin facultad es la universidad y el dinero pasa de centavos a pesos', () => {
    const fila = indicadores({ ...VACIA, activos: 4, inscritos: 2, cargos: 150_000, pagado: 60_000, becas: 50_000 });
    expect(fila).toMatchObject({
      facultadNombre: 'Universidad',
      inscripcionPorcentaje: 50,
      cargos: 1500,
      pagado: 600,
      cobranzaPorcentaje: 73.33,
    });
    expect(indicadores({ ...VACIA, facultadClave: 'CUTG', facultadNombre: 'Centro' }).facultadNombre).toBe('Centro');
  });
});
