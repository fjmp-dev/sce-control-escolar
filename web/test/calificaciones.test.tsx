// @vitest-environment jsdom
// RF-004 y RF-005 en el portal (Batch 8): captura del profesor, consulta y kardex del alumno, exportacion tabular,
// ciclo del periodo y correccion de coordinacion (D-17).
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaginaCorrecciones from '@/app/(portal)/correcciones/page';
import { GET as historialDelAlumno } from '@/app/(portal)/mis-calificaciones/historial.csv/route';
import PaginaMisCalificaciones from '@/app/(portal)/mis-calificaciones/page';
import PaginaCalificacionesDelGrupo from '@/app/(portal)/mis-grupos/[id]/page';
import PaginaPeriodos from '@/app/(portal)/periodos/page';
import { historialCsv } from '@/lib/csv';

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'tok' }), set: vi.fn(), delete: vi.fn() }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  redirect: (destino: string) => {
    throw new Error(`REDIRECCION:${destino}`);
  },
  notFound: () => {
    throw new Error('NO_ENCONTRADO');
  },
}));

const parcial = (id: number, numero: number, valor: number) => ({
  id,
  parcial: numero,
  valor,
  fechaCaptura: '2026-09-01T16:00:00.000Z',
});
const materia = (datos: Partial<Record<string, unknown>>) => ({
  periodoClave: '2026B',
  estadoPeriodo: 'en_curso',
  grupoClave: 'ISW-301-B',
  materiaClave: 'ISW-301',
  materiaNombre: 'Bases de datos',
  creditos: 8,
  parciales: [parcial(11, 1, 9)],
  final: null,
  acreditada: null,
  vigente: null,
  ...datos,
});
const COORDINACION = { id: 'u', correo: 'c@sce.test', roles: ['coordinacion'] };
const CALIFICACIONES = {
  matricula: '2420001',
  historial: { promedio: 8.17, creditosAcumulados: 8, avance: 2 },
  materias: [
    materia({}),
    materia({
      periodoClave: '2026A',
      estadoPeriodo: 'cerrado',
      grupoClave: 'ISW-101-A',
      materiaClave: 'ISW-101',
      materiaNombre: 'Programación "I"',
      parciales: [parcial(1, 1, 8.5), parcial(2, 2, 7), parcial(3, 3, 9)],
      final: 8.17,
      acreditada: true,
      vigente: true,
    }),
  ],
};

function api(respuestas: Record<string, unknown>) {
  const espia = vi.fn(async (url: string) => {
    const ruta = url.replace('http://localhost:3001', '');
    return ruta in respuestas
      ? Response.json(respuestas[ruta])
      : Response.json({ codigo: 'NO_ENCONTRADO', mensaje: ruta }, { status: 404 });
  });
  vi.stubGlobal('fetch', espia);
  return espia;
}

afterEach(cleanup);

describe('Mis calificaciones (RF-004, Tabla 4)', () => {
  it('historial, parciales del periodo en curso al momento y kardex con la final', async () => {
    api({ '/alumnos/actual/calificaciones': CALIFICACIONES });
    render(await PaginaMisCalificaciones());
    expect(screen.getByText('8.17', { selector: 'dd' })).toBeTruthy();
    const enCurso = screen.getByRole('table', { name: 'Calificaciones del periodo en curso' });
    const fila = within(enCurso).getByRole('row', { name: /ISW-301 Bases de datos/ });
    within(fila).getByRole('cell', { name: '9.00' });
    expect(within(fila).getAllByRole('cell', { name: '—' })).toHaveLength(3);
    const kardex = screen.getByRole('table', { name: 'Kárdex' });
    within(kardex).getByRole('cell', { name: 'Acreditada' });
    within(kardex).getByRole('cell', { name: '8.17' });
    expect(screen.getByRole('link', { name: 'Descargar mi historial (CSV)' }).getAttribute('href')).toBe(
      '/mis-calificaciones/historial.csv',
    );
  });

  it('sin expediente lo dice en texto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ codigo: 'SIN_EXPEDIENTE', mensaje: 'Sin expediente.' }, { status: 404 })),
    );
    render(await PaginaMisCalificaciones());
    expect(screen.getByText('Sin expediente.')).toBeTruthy();
  });
});

describe('Exportacion tabular del historial (Tabla 16, Portabilidad)', () => {
  it('solo periodos cerrados, con comillas escapadas, BOM y el resumen del historial', () => {
    const csv = historialCsv(CALIFICACIONES as never);
    const lineas = csv.split('\r\n');
    expect(csv.startsWith('﻿"matricula","periodo"')).toBe(true);
    expect(lineas).toHaveLength(7);
    expect(lineas[1]).toBe('"2420001","2026A","ISW-101","Programación ""I""","ISW-101-A","8","8.17","si","si"');
    expect(csv).not.toContain('2026B');
    expect(lineas[5]).toBe('"avance_porcentaje","2.00"');
  });

  it('la ruta responde un CSV descargable con el nombre de la matricula', async () => {
    api({ '/alumnos/actual/calificaciones': CALIFICACIONES });
    const res = await historialDelAlumno();
    expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="historial-2420001.csv"');
    expect(await res.text()).toContain('"ISW-101"');
  });
});

describe('Captura del profesor (RF-004, CF-CAL-01)', () => {
  const grupo = (estadoPeriodo: string, parciales: number[]) => ({
    id: 12,
    clave: 'ISW-301-B',
    materiaClave: 'ISW-301',
    materiaNombre: 'Bases de datos',
    periodoClave: '2026B',
    estadoPeriodo,
    parciales,
    alumnos: [
      {
        folio: 'INS-1',
        matricula: '2420001',
        nombre: 'Alumno Uno',
        calificaciones: [parcial(1, 1, 9), parcial(2, 2, 6)],
      },
      { folio: 'INS-2', matricula: '2420002', nombre: 'Alumno Dos', calificaciones: [parcial(3, 1, 7.5)] },
    ],
  });
  const pagina = (parcialPedido?: string) =>
    PaginaCalificacionesDelGrupo({
      params: Promise.resolve({ id: '12' }),
      searchParams: Promise.resolve({ parcial: parcialPedido }),
    });

  it('en curso: tabla de parciales y captura del ultimo parcial, con cada alumno etiquetado y su valor', async () => {
    api({ '/grupos/12/calificaciones': grupo('en_curso', [1, 2]) });
    render(await pagina());
    screen.getByRole('heading', { name: 'Capturar el parcial 2' });
    expect(screen.getByLabelText<HTMLInputElement>('Alumno Uno (2420001)').value).toBe('6');
    expect(screen.getByLabelText<HTMLInputElement>('Alumno Dos (2420002)').value).toBe('');
    expect(screen.getByLabelText<HTMLInputElement>('Alumno Dos (2420002)').name).toBe('valor:INS-2');
    expect(document.querySelector<HTMLInputElement>('input[name=parcial]')?.value).toBe('2');
    screen.getByRole('button', { name: 'Guardar el parcial 2' });
  });

  it('el parcial se elige por la direccion; uno fuera de 1 a 4 se ignora', async () => {
    api({ '/grupos/12/calificaciones': grupo('en_curso', [1, 2]) });
    render(await pagina('1'));
    expect(screen.getByLabelText<HTMLInputElement>('Alumno Dos (2420002)').value).toBe('7.5');
    cleanup();
    render(await pagina('9'));
    screen.getByRole('heading', { name: 'Capturar el parcial 2' });
  });

  it('cerrado: sin captura y remite a coordinacion; un grupo que no existe da 404', async () => {
    api({ '/grupos/12/calificaciones': grupo('cerrado', [1]) });
    render(await pagina());
    screen.getByText(/pídelo a coordinación/);
    expect(screen.queryByRole('button', { name: /Guardar/ })).toBeNull();
    cleanup();
    api({});
    await expect(pagina()).rejects.toThrow('NO_ENCONTRADO');
  });
});

describe('Ciclo del periodo y correcciones de coordinacion', () => {
  it('Periodos ofrece iniciar el abierto publicado y cerrar el que esta en curso', async () => {
    const periodo = (clave: string, estado: string, ofertaPublicadaEn: string | null) => ({
      clave,
      estado,
      ofertaPublicadaEn,
      fechaInicio: '2026-08-03T00:00:00.000Z',
      fechaFin: '2026-12-18T00:00:00.000Z',
    });
    api({
      '/sesiones/actual': { id: 'u', correo: 'c@sce.test', roles: ['coordinacion'] },
      '/periodos': [
        periodo('2027A', 'abierto', '2026-12-01T15:00:00.000Z'),
        periodo('2027B', 'abierto', null),
        periodo('2026B', 'en_curso', '2026-07-01T15:00:00.000Z'),
      ],
    });
    render(await PaginaPeriodos());
    screen.getByRole('button', { name: 'Iniciar el curso de 2027A' });
    expect(screen.queryByRole('button', { name: 'Iniciar el curso de 2027B' })).toBeNull();
    screen.getByRole('button', { name: 'Cerrar el periodo 2026B' });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('el resultado de iniciar o cerrar se confirma contra el estado real del periodo', async () => {
    const periodos = [
      { clave: '2026B', estado: 'cerrado', ofertaPublicadaEn: null, fechaInicio: '2026-08-03', fechaFin: '2026-12-18' },
      {
        clave: '2027A',
        estado: 'en_curso',
        ofertaPublicadaEn: null,
        fechaInicio: '2027-01-12',
        fechaFin: '2027-06-30',
      },
    ];
    const pagina = (hecho: string, periodo: string) =>
      PaginaPeriodos({ searchParams: Promise.resolve({ hecho, periodo }) });
    api({ '/sesiones/actual': { id: 'u', correo: 'c@sce.test', roles: ['coordinacion'] }, '/periodos': periodos });
    render(await pagina('cierre', '2026B'));
    expect(screen.getByRole('status').textContent).toContain('Periodo 2026B cerrado');
    cleanup();
    for (const [hecho, periodo] of [
      ['cierre', '2027A'],
      ['inicio', '2026B'],
      ['<script>', '2026B'],
      ['cierre', 'NO-EXISTE'],
    ]) {
      render(await pagina(hecho, periodo));
      expect(screen.queryByText(/iniciado|cerrado\./)).toBeNull();
      cleanup();
    }
  });

  it('Correcciones busca por matricula y ofrece solo calificaciones de periodos cerrados', async () => {
    api({ '/sesiones/actual': COORDINACION, '/alumnos/2420001/calificaciones': CALIFICACIONES });
    render(await PaginaCorrecciones({ searchParams: Promise.resolve({ matricula: '2420001' }) }));
    const selector = screen.getByLabelText<HTMLSelectElement>('Calificación a corregir');
    const opciones = within(selector).getAllByRole('option').slice(1);
    expect(opciones.map((o) => o.textContent)).toEqual([
      '2026A, ISW-101 Programación "I", parcial 1: 8.50',
      '2026A, ISW-101 Programación "I", parcial 2: 7.00',
      '2026A, ISW-101 Programación "I", parcial 3: 9.00',
    ]);
    expect(opciones[0].getAttribute('value')).toBe('1');
    screen.getByLabelText('Motivo');
    screen.getByLabelText('Evidencia');
    screen.getByRole('button', { name: 'Autorizar la corrección' });
  });

  it('una matricula sin expediente lo dice; sin buscar no consulta expedientes', async () => {
    api({ '/sesiones/actual': COORDINACION });
    render(await PaginaCorrecciones({ searchParams: Promise.resolve({ matricula: '9999999' }) }));
    screen.getByText(/No hay un expediente con la matrícula 9999999/);
    cleanup();
    const espia = api({ '/sesiones/actual': COORDINACION });
    render(await PaginaCorrecciones({ searchParams: Promise.resolve({}) }));
    expect(espia.mock.calls.map(([url]) => url)).not.toContainEqual(expect.stringContaining('/alumnos/'));
    expect(screen.queryByRole('button', { name: 'Autorizar la corrección' })).toBeNull();
  });

  it('a quien no es de coordinacion lo lleva a sin permiso, aunque no busque nada', async () => {
    api({ '/sesiones/actual': { id: 'u', correo: 'p@sce.test', roles: ['profesor'] } });
    await expect(PaginaCorrecciones({ searchParams: Promise.resolve({}) })).rejects.toThrow('REDIRECCION:/sin-permiso');
  });
});
