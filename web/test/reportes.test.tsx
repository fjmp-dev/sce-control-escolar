// @vitest-environment jsdom
// RF-009 en el portal (Batch 10): dirección consulta por periodo inscripción, avance y cobranza, sin datos de alumnos.
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaginaReportes from '@/app/(portal)/reportes/page';

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'tok' }), set: vi.fn(), delete: vi.fn() }),
}));
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

const periodo = (clave: string, estado: string) => ({
  clave,
  fechaInicio: '2026-01-10T00:00:00.000Z',
  fechaFin: '2026-06-10T00:00:00.000Z',
  estado,
});
const fila = (facultadClave: string | null, facultadNombre: string) => ({
  facultadClave,
  facultadNombre,
  alumnosActivos: 4,
  inscritos: 2,
  inscripcionPorcentaje: 50,
  promedioGeneral: 7.88,
  avancePromedio: 3.88,
  cargos: 1500,
  pagado: 600,
  becas: 500,
  saldoPendiente: 400,
  alumnosConAdeudo: 1,
  cobranzaPorcentaje: 73.33,
});
const reporte = (periodoClave: string) => ({
  periodoClave,
  generadoEn: '2026-11-10T16:00:00.000Z',
  filas: [fila('CUTG', 'Centro Universitario Tenancingo'), fila(null, 'Universidad')],
});

function api(respuestas: Record<string, unknown>) {
  const fetch = vi.fn(async (url: string) => {
    const ruta = url.replace('http://localhost:3001', '');
    return ruta in respuestas
      ? Response.json(respuestas[ruta])
      : Response.json({ codigo: 'NO_ENCONTRADO', mensaje: ruta }, { status: 404 });
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}
const buscar = (periodo?: string) => ({ searchParams: Promise.resolve({ periodo }) });
const PERIODOS = [periodo('2026B', 'cerrado'), periodo('2027A', 'abierto')];

afterEach(cleanup);

describe('Reportes de dirección (RF-009)', () => {
  it('sin periodo elegido muestra el más reciente con las tres tablas y la fila de la universidad', async () => {
    api({ '/periodos': PERIODOS, '/periodos/2027A/reporte': reporte('2027A') });
    render(await PaginaReportes(buscar()));
    expect((screen.getByLabelText('Periodo') as HTMLSelectElement).value).toBe('2027A');
    screen.getByRole('option', { name: '2026B (Cerrado)' });
    const inscripcion = screen.getByRole('table', { name: 'Inscripción en 2027A' });
    within(within(inscripcion).getByRole('row', { name: /Universidad/ })).getByRole('cell', { name: '50.00 %' });
    within(screen.getByRole('table', { name: 'Avance académico' })).getAllByRole('cell', { name: '7.88' });
    const cobranza = within(screen.getByRole('table', { name: 'Cobranza' }));
    cobranza.getAllByRole('cell', { name: '$1,500.00' });
    cobranza.getAllByRole('cell', { name: '73.33 %' });
  });

  it('consulta el periodo elegido y avisa si no existe', async () => {
    const fetch = api({ '/periodos': PERIODOS, '/periodos/2026B/reporte': reporte('2026B') });
    render(await PaginaReportes(buscar('2026B')));
    screen.getByRole('table', { name: 'Inscripción en 2026B' });
    expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('2027A'), expect.anything());
    cleanup();

    render(await PaginaReportes(buscar('1999A')));
    screen.getByText('No hay un periodo 1999A. Elige uno de la lista.');
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('sin periodos lo dice', async () => {
    api({ '/periodos': [] });
    render(await PaginaReportes(buscar()));
    screen.getByText('Todavía no hay periodos.');
    expect(screen.queryByRole('table')).toBeNull();
  });
});
