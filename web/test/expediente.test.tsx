// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaginaExpediente from '@/app/(portal)/expedientes/[matricula]/page';
import PaginaExpedientes from '@/app/(portal)/expedientes/page';
import PaginaMiExpediente from '@/app/(portal)/mi-expediente/page';

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

const EXPEDIENTE = {
  matricula: '2420001',
  nombre: 'Alumno Sintético Uno',
  facultadClave: 'FSD',
  facultadNombre: 'Facultad Sintética Dos',
  estatus: 'activo',
  fechaIngreso: '2024-08-05T00:00:00.000Z',
  correo: 'alumno@sce.test',
  historial: { promedio: 8.5, creditosAcumulados: 120, avance: 30 },
  trayectoria: [{ de: 'CUTG', a: 'FSD', fecha: '2026-11-07T10:00:00.000Z' }],
};
const FACULTADES = [
  { clave: 'CUTG', nombre: 'Centro' },
  { clave: 'FSD', nombre: 'Facultad Sintética Dos' },
];

function api(respuestas: Record<string, [number, unknown]>) {
  const espia = vi.fn(async (url: string) => {
    const ruta = url.replace('http://localhost:3001', '');
    const [estado, cuerpo] = respuestas[ruta] ?? [500, { codigo: 'ERROR_INTERNO', mensaje: ruta }];
    return Response.json(cuerpo, { status: estado });
  });
  vi.stubGlobal('fetch', espia);
  return espia;
}

afterEach(cleanup);

describe('Expedientes (control escolar)', () => {
  it('busca con lo escrito y muestra solo matricula, nombre, facultad y estatus', async () => {
    const espia = api({
      '/alumnos?buscar=sint%C3%A9tico%20uno': [
        200,
        [{ matricula: '2420001', nombre: 'Alumno Sintético Uno', facultadClave: 'CUTG', estatus: 'baja' }],
      ],
      '/facultades': [200, FACULTADES],
    });
    render(await PaginaExpedientes({ searchParams: Promise.resolve({ buscar: ' sintético uno ' }) }));
    expect(espia).toHaveBeenCalledWith('http://localhost:3001/alumnos?buscar=sint%C3%A9tico%20uno', expect.anything());
    expect(screen.getByRole<HTMLInputElement>('searchbox', { name: /Buscar por matrícula o nombre/ }).value).toBe(
      'sintético uno',
    );
    expect(screen.getByRole('link', { name: '2420001' }).getAttribute('href')).toBe('/expedientes/2420001');
    expect(screen.getByRole('cell', { name: 'Baja' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Resultados para «sintético uno»' })).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Correo de la cuenta del alumno (opcional)').required).toBe(false);
    expect(screen.getByLabelText<HTMLInputElement>('Matrícula').required).toBe(true);
  });

  it('sin busqueda lista los recientes', async () => {
    api({ '/alumnos': [200, []], '/facultades': [200, FACULTADES] });
    render(await PaginaExpedientes({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('heading', { name: 'Expedientes recientes' })).toBeTruthy();
    expect(screen.getByText('Todavía no hay registros.')).toBeTruthy();
  });

  it('la ficha muestra datos, historial y trayectoria, y no ofrece la facultad ni el estatus actuales', async () => {
    api({
      '/alumnos/2420001': [200, EXPEDIENTE],
      '/facultades': [200, FACULTADES],
      '/alumnos/2420001/inscripciones': [200, []],
    });
    render(await PaginaExpediente({ params: Promise.resolve({ matricula: '2420001' }) }));
    expect(screen.getByRole('heading', { name: 'Expediente de Alumno Sintético Uno' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Inscripciones' })).toBeTruthy();
    expect(screen.getByText('8.50')).toBeTruthy();
    expect(screen.getByText('30.00 %')).toBeTruthy();
    expect(screen.getByText(/De CUTG a FSD, el/)).toBeTruthy();
    const destino = screen.getByLabelText<HTMLSelectElement>('Facultad destino');
    expect(within(destino).queryByRole('option', { name: /FSD/ })).toBeNull();
    within(destino).getByRole('option', { name: 'CUTG · Centro' });
    const estatus = screen.getByLabelText<HTMLSelectElement>('Nuevo estatus');
    expect(within(estatus).queryByRole('option', { name: 'Activo' })).toBeNull();
    expect(document.querySelectorAll('input[type=hidden][name=matricula][value="2420001"]')).toHaveLength(3);
  });

  it.each([404, 400])('una matricula que la API no encuentra (%i) da la pagina de no encontrado', async (estado) => {
    api({ '/alumnos/9999999': [estado, { codigo: 'NO_ENCONTRADO', mensaje: 'x' }], '/facultades': [200, FACULTADES] });
    await expect(PaginaExpediente({ params: Promise.resolve({ matricula: '9999999' }) })).rejects.toThrow(
      'NO_ENCONTRADO',
    );
  });

  it('otros errores llegan a la pagina de error', async () => {
    api({ '/facultades': [200, FACULTADES] });
    await expect(PaginaExpediente({ params: Promise.resolve({ matricula: '2420001' }) })).rejects.toThrow();
  });
});

describe('Mi expediente (alumno)', () => {
  it('muestra el suyo, sin formularios', async () => {
    api({ '/alumnos/actual': [200, { ...EXPEDIENTE, trayectoria: [], correo: null }] });
    render(await PaginaMiExpediente());
    expect(screen.getByText('Sin cambios de plantel.')).toBeTruthy();
    expect(screen.getByText('Sin cuenta vinculada')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('sin expediente vinculado explica la causa y que hacer', async () => {
    api({
      '/alumnos/actual': [
        404,
        { codigo: 'SIN_EXPEDIENTE', mensaje: 'Tu cuenta no está vinculada. Acude a control escolar.' },
      ],
    });
    render(await PaginaMiExpediente());
    expect(screen.getByRole('status').textContent).toContain('Acude a control escolar');
  });

  it('otros errores llegan a la pagina de error', async () => {
    api({ '/alumnos/actual': [500, { codigo: 'ERROR_INTERNO', mensaje: 'x' }] });
    await expect(PaginaMiExpediente()).rejects.toThrow();
  });
});
