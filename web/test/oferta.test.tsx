// @vitest-environment jsdom
// RF-003 en el portal (Batch 7): coordinacion define y publica la oferta; profesor y alumno consultan su horario (Tabla 4).
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaginaMiHorario from '@/app/(portal)/mi-horario/page';
import PaginaMisGrupos from '@/app/(portal)/mis-grupos/page';
import PaginaOferta from '@/app/(portal)/oferta/page';
import { menuDe } from '@/lib/roles';

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'tok' }), set: vi.fn(), delete: vi.fn() }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  redirect: (destino: string) => {
    throw new Error(`REDIRECCION:${destino}`);
  },
}));

const periodo = (clave: string, estado: string, ofertaPublicadaEn: string | null) => ({
  clave,
  fechaInicio: `${clave.slice(0, 4)}-01-12T00:00:00.000Z`,
  fechaFin: `${clave.slice(0, 4)}-06-30T00:00:00.000Z`,
  estado,
  ofertaPublicadaEn,
});
const SIN_PUBLICAR = periodo('2028A', 'abierto', null);
const PUBLICADO = periodo('2027A', 'abierto', '2026-12-01T15:00:00.000Z');
const CERRADO = periodo('2026B', 'cerrado', '2026-07-01T15:00:00.000Z');
const grupo = (id: number, clave: string, horarios: [number, string, string, string][]) => ({
  id,
  clave,
  materiaClave: 'ISW-201',
  materiaNombre: 'Programación II',
  creditos: 8,
  cupo: 30,
  ocupacion: 3,
  horarios: horarios.map(([dia, horaInicio, horaFin, aula]) => ({ dia, horaInicio, horaFin, aula })),
});
const G1 = grupo(1, 'ISW-201-A', [
  [3, '07:00', '09:00', 'A1'],
  [1, '07:00', '09:00', 'A1'],
]);
const G2 = {
  ...grupo(2, 'ISW-301-A', [[1, '09:00', '11:00', 'A2']]),
  materiaClave: 'ISW-301',
  materiaNombre: 'Bases de datos',
};

function api(respuestas: Record<string, unknown>) {
  const espia = vi.fn(async (url: string) => {
    const ruta = url.replace('http://localhost:3001', '');
    return ruta in respuestas
      ? Response.json(respuestas[ruta])
      : Response.json({ codigo: 'ERROR_INTERNO', mensaje: ruta }, { status: 500 });
  });
  vi.stubGlobal('fetch', espia);
  return espia;
}
const paginaOferta = (periodo?: string) => PaginaOferta({ searchParams: Promise.resolve({ periodo }) });

afterEach(cleanup);

describe('Oferta de coordinacion (RF-003, Fig. 7)', () => {
  const materias = [{ clave: 'ISW-201', planClave: 'ISW-2024', nombre: 'Programación II', creditos: 8 }];

  it('por omision abre el periodo abierto mas proximo: grupos con profesor, publicar y definir', async () => {
    api({
      '/periodos': [SIN_PUBLICAR, PUBLICADO, CERRADO],
      '/materias': materias,
      '/periodos/2027A/grupos': [{ ...G1, profesor: 'profesor@sce.test' }],
    });
    render(await paginaOferta());
    screen.getByRole('heading', { name: 'Oferta 2027A' });
    const fila = within(screen.getByRole('table', { name: 'Grupos de 2027A' })).getByRole('row', { name: /ISW-201-A/ });
    within(fila).getByRole('cell', { name: 'profesor@sce.test' });
    within(fila).getByRole('cell', { name: '3 de 30' });
    screen.getByText(/Oferta publicada el 1 dic 2026/);
    expect(screen.queryByRole('button', { name: /Publicar la oferta/ })).toBeNull();
    screen.getByRole('button', { name: 'Definir grupo' });
    const sesiones = screen.getByRole('table', { name: 'Sesiones de 2027A' });
    const [, lunes, miercoles] = within(sesiones).getAllByRole('row');
    within(lunes).getByRole('cell', { name: 'Lunes' });
    within(miercoles).getByRole('cell', { name: 'Miércoles' });
  });

  it('sin publicar: lo dice, ofrece publicar y el formulario tiene una sesion obligatoria y dos opcionales', async () => {
    api({ '/periodos': [SIN_PUBLICAR], '/materias': materias, '/periodos/2028A/grupos': [] });
    render(await paginaOferta('2028A'));
    screen.getByText(/todavía no se publica: los alumnos no la ven/);
    screen.getByRole('button', { name: 'Publicar la oferta de 2028A' });
    expect(document.querySelectorAll('input[name=periodoClave]')).toHaveLength(2);
    const primera = screen.getByRole('group', { name: 'Sesión 1' });
    expect(within(primera).getByLabelText<HTMLSelectElement>('Día').required).toBe(true);
    const segunda = screen.getByRole('group', { name: 'Sesión 2 (opcional)' });
    expect(within(segunda).getByLabelText<HTMLSelectElement>('Día').required).toBe(false);
    expect(within(segunda).getByLabelText<HTMLInputElement>('Aula').required).toBe(false);
    expect(within(primera).getByLabelText<HTMLInputElement>('Hora de inicio').type).toBe('time');
    screen.getByText('Todavía no hay registros.');
  });

  it('un periodo cerrado se consulta, pero no se define ni se publica', async () => {
    api({ '/periodos': [PUBLICADO, CERRADO], '/materias': materias, '/periodos/2026B/grupos': [] });
    render(await paginaOferta('2026B'));
    screen.getByRole('heading', { name: 'Oferta 2026B' });
    expect(screen.queryByRole('button', { name: 'Definir grupo' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Publicar/ })).toBeNull();
  });

  it('sin periodos, remite a abrir uno; un periodo desconocido en la URL no se consulta', async () => {
    api({ '/periodos': [], '/materias': materias });
    render(await paginaOferta());
    screen.getByText(/No hay periodos/);
    cleanup();
    const espia = api({ '/periodos': [PUBLICADO], '/materias': materias, '/periodos/2027A/grupos': [] });
    render(await paginaOferta('../usuarios'));
    expect(espia.mock.calls.map(([url]) => url)).not.toContainEqual(expect.stringContaining('usuarios'));
  });
});

describe('Consulta diferenciada por rol (Tabla 4)', () => {
  it('el profesor ve sus grupos por periodo, con inscritos y su horario ordenado', async () => {
    api({
      '/profesores/actual/grupos': [
        { ...G1, periodoClave: '2027A' },
        { ...G2, periodoClave: '2027A' },
      ],
    });
    render(await PaginaMisGrupos());
    screen.getByRole('heading', { name: 'Periodo 2027A' });
    const grupos = screen.getByRole('table', { name: 'Grupos de 2027A' });
    within(within(grupos).getByRole('row', { name: /ISW-301-A/ })).getByRole('cell', { name: '3 de 30' });
    const filas = within(screen.getByRole('table', { name: 'Horario de 2027A' }))
      .getAllByRole('row')
      .slice(1);
    expect(filas.map((f) => f.textContent)).toEqual([
      expect.stringMatching(/^Lunes07:00 a 09:00.*ISW-201-A/),
      expect.stringMatching(/^Lunes09:00 a 11:00.*ISW-301-A/),
      expect.stringMatching(/^Miércoles07:00 a 09:00.*ISW-201-A/),
    ]);
  });

  it('el profesor sin grupos lo lee en texto', async () => {
    api({ '/profesores/actual/grupos': [] });
    render(await PaginaMisGrupos());
    expect(screen.getByText(/No tienes grupos asignados/)).toBeTruthy();
  });

  it('el alumno ve el horario de su carga confirmada, no el de una rechazada ni el de un periodo cerrado', async () => {
    const inscripcion = (periodoClave: string, estado: string, grupos: unknown[]) => ({
      folio: `INS-${periodoClave}-2420001`,
      matricula: '2420001',
      periodoClave,
      estado,
      motivoRechazo: null,
      fecha: '2027-01-10T16:30:00.000Z',
      grupos,
    });
    api({
      '/alumnos/actual/inscripciones': [
        inscripcion('2027A', 'confirmada', [G1]),
        inscripcion('2026B', 'cerrada', [G2]),
        inscripcion('2028A', 'rechazada', [G2]),
      ],
    });
    render(await PaginaMiHorario());
    screen.getByRole('heading', { name: 'Periodo 2027A' });
    expect(screen.queryByRole('heading', { name: 'Periodo 2026B' })).toBeNull();
    expect(screen.queryByText(/ISW-301-A/)).toBeNull();
    expect(within(screen.getByRole('table', { name: 'Mi horario de 2027A' })).getAllByRole('row')).toHaveLength(3);
  });

  it('el alumno sin carga confirmada, o sin expediente, lo lee en texto', async () => {
    api({ '/alumnos/actual/inscripciones': [] });
    render(await PaginaMiHorario());
    expect(screen.getByText(/No tienes una carga confirmada/)).toBeTruthy();
    cleanup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ codigo: 'SIN_EXPEDIENTE', mensaje: 'Tu cuenta no tiene expediente.' }, { status: 404 }),
      ),
    );
    render(await PaginaMiHorario());
    expect(screen.getByText('Tu cuenta no tiene expediente.')).toBeTruthy();
  });

  it('cada rol ve en el menu solo su consulta de horario', () => {
    const rutas = (rol: Parameters<typeof menuDe>[0][number]) => menuDe([rol]).map((e) => e.ruta);
    expect(rutas('alumno')).toContain('/mi-horario');
    expect(rutas('profesor')).toEqual(expect.arrayContaining(['/mis-grupos']));
    expect(rutas('profesor')).not.toContain('/oferta');
    expect(rutas('coordinacion')).toContain('/oferta');
    expect(rutas('caja')).not.toEqual(expect.arrayContaining(['/oferta']));
  });
});
