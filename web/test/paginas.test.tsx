// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PaginaContrasena from '@/app/(portal)/contrasena/page';
import PaginaFacultades from '@/app/(portal)/facultades/page';
import LayoutPortal from '@/app/(portal)/layout';
import PaginaMaterias from '@/app/(portal)/materias/page';
import PaginaInicio from '@/app/(portal)/page';
import PaginaPeriodos from '@/app/(portal)/periodos/page';
import PaginaPlanes from '@/app/(portal)/planes/page';
import PaginaSinPermiso from '@/app/(portal)/sin-permiso/page';
import PaginaUsuarios from '@/app/(portal)/usuarios/page';
import PaginaIngresar from '@/app/ingresar/page';
import LayoutRaiz from '@/app/layout';
import PaginaNoEncontrada from '@/app/not-found';
import { GET as salud } from '@/app/salud/route';
import type { Rol } from '@/lib/contrato';

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

const FACULTAD = { clave: 'CUTG', nombre: 'Centro Universitario' };
const PLAN = {
  clave: 'ISW-2024',
  facultadClave: 'CUTG',
  creditosTotales: 400,
  vigenteDesde: '2024-08-01T00:00:00.000Z',
};
const MATERIAS = [
  { clave: 'ISW-101', planClave: 'ISW-2024', nombre: 'Programación I', creditos: 8, requiereDe: [] },
  {
    clave: 'ISW-201',
    planClave: 'ISW-2024',
    nombre: 'Programación II',
    creditos: 8,
    requiereDe: [{ materiaClave: 'ISW-201', requiereClave: 'ISW-101', obligatorio: true }],
  },
  {
    clave: 'ISW-301',
    planClave: 'ISW-2024',
    nombre: 'Bases de datos',
    creditos: 8,
    requiereDe: [{ materiaClave: 'ISW-301', requiereClave: 'ISW-101', obligatorio: false }],
  },
];
const PERIODO = {
  clave: '2027A',
  fechaInicio: '2027-01-12T00:00:00.000Z',
  fechaFin: '2027-06-30T00:00:00.000Z',
  estado: 'en_curso',
  ofertaPublicadaEn: '2026-12-01T15:00:00.000Z',
};
const YO = 'u-yo';
const USUARIOS = [
  { id: YO, correo: 'yo@sce.test', activo: true, roles: ['administrador'] },
  { id: 'u-2', correo: 'otra@sce.test', activo: false, roles: ['caja'] },
];

function api(roles: Rol[], vacio = false) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const ruta = url.replace('http://localhost:3001', '');
      const datos: Record<string, unknown> = {
        '/sesiones/actual': { id: YO, correo: 'yo@sce.test', roles },
        '/facultades': vacio ? [] : [FACULTAD],
        '/planes': vacio ? [] : [PLAN],
        '/materias': vacio ? [] : MATERIAS,
        '/periodos': vacio ? [] : [PERIODO],
        '/usuarios': USUARIOS,
      };
      return Response.json(datos[ruta]);
    }),
  );
}

const mostrar = (elemento: ReactElement) => render(elemento);

beforeEach(() => api(['alumno']));
afterEach(cleanup);

describe('Layout y navegacion por rol', () => {
  it('muestra quien entro con su rol legible, el menu de su rol y como salir', async () => {
    api(['coordinacion']);
    mostrar(await LayoutPortal({ children: <p>Contenido</p> }));
    screen.getByText(/yo@sce\.test · Coordinación académica/);
    screen.getByRole('button', { name: 'Cerrar sesión' });
    const menu = screen.getByRole('navigation', { name: 'Principal' });
    expect(within(menu).queryByRole('link', { name: 'Usuarios' })).toBeNull();
    within(menu).getByRole('link', { name: 'Materias' });
    expect(screen.getByRole('main').id).toBe('contenido');
    screen.getByText('Contenido');
  });

  it('el inicio lista lo que el rol puede hacer', async () => {
    api(['administrador']);
    mostrar(await PaginaInicio());
    expect(screen.getByText(/Entraste como Administrador del sistema/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Usuarios' }).getAttribute('href')).toBe('/usuarios');
    expect(screen.getByText('Dar de alta, cambiar roles y dar de baja')).toBeTruthy();
  });

  it('la raiz declara el idioma y el salto al contenido', () => {
    const html = renderToStaticMarkup(LayoutRaiz({ children: <p>x</p> }));
    expect(html).toContain('lang="es-MX"');
    expect(html).toContain('href="#contenido"');
  });
});

describe('Paginas de catalogos: solo el rol autorizado ve el alta (CF-ROL-01)', () => {
  it.each([
    ['facultades', PaginaFacultades, 'administrador', 'Centro Universitario', 'Dar de alta'],
    ['planes', PaginaPlanes, 'administrador', '400', 'Dar de alta'],
    ['materias', PaginaMaterias, 'coordinacion', 'Programación II', 'Dar de alta'],
    ['periodos', PaginaPeriodos, 'coordinacion', 'En curso', 'Abrir periodo'],
  ] as const)('%s', async (_, Pagina, rolConAlta, dato, boton) => {
    api([rolConAlta]);
    mostrar(await Pagina());
    expect(screen.getByRole('button', { name: boton })).toBeTruthy();
    expect(screen.getByRole('cell', { name: dato })).toBeTruthy();
    cleanup();

    api(['alumno']);
    mostrar(await Pagina());
    expect(screen.queryByRole('button', { name: boton })).toBeNull();
    screen.getByRole('cell', { name: dato });
    cleanup();

    api(['alumno'], true);
    mostrar(await Pagina());
    screen.getByText('Todavía no hay registros.');
  });

  it('materias: prerrequisitos legibles y formularios para coordinacion', async () => {
    api(['coordinacion']);
    mostrar(await PaginaMaterias());
    screen.getByRole('cell', { name: 'ISW-101 (obligatorio)' });
    screen.getByRole('cell', { name: 'ISW-101 (opcional)' });
    screen.getByRole('cell', { name: 'Ninguno' });
    expect(screen.getByRole('button', { name: 'Agregar prerrequisito' })).toBeTruthy();
    const quitar = screen.getByLabelText<HTMLSelectElement>('Prerrequisito a quitar');
    within(quitar).getByRole('option', { name: 'ISW-201 requiere ISW-101' });
    expect(screen.getByRole<HTMLOptionElement>('option', { name: 'ISW-201 requiere ISW-101' }).value).toBe(
      'ISW-201|ISW-101',
    );
  });

  it('periodos: una fecha se muestra sin recorrerse y un estado desconocido no se pierde', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        Response.json(
          url.endsWith('/periodos') ? [{ ...PERIODO, estado: 'otro' }] : { id: YO, correo: 'y', roles: ['alumno'] },
        ),
      ),
    );
    mostrar(await PaginaPeriodos());
    expect(screen.getByRole('cell', { name: 'otro' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: /12 ene/ })).toBeTruthy();
    expect(screen.getByRole('cell', { name: /Publicada el 1 dic 2026/ })).toBeTruthy();
  });
});

describe('Usuarios', () => {
  it('lista con estado en texto, y no ofrece cambiar la cuenta propia', async () => {
    api(['administrador']);
    mostrar(await PaginaUsuarios());
    const propia = screen.getByRole('row', { name: /yo@sce\.test/ });
    within(propia).getByText(/Tu propia cuenta/);
    expect(within(propia).queryByText(/Cambiar acceso/)).toBeNull();

    const otra = screen.getByRole('row', { name: /otra@sce\.test/ });
    within(otra).getByRole('cell', { name: 'Inactivo' });
    within(otra).getByRole('cell', { name: 'Caja' });
    within(otra).getByText('Cambiar acceso de otra@sce.test');
    expect(within(otra).getByLabelText<HTMLInputElement>('Cuenta activa', { selector: 'input' }).checked).toBe(false);
    expect(within(otra).getByLabelText<HTMLInputElement>('Caja', { selector: 'input' }).checked).toBe(true);
    expect(screen.getByRole('button', { name: 'Dar de alta' })).toBeTruthy();
  });
});

describe('Paginas sin datos', () => {
  it('ingresar explica el motivo solo si lo conoce', async () => {
    mostrar(await PaginaIngresar({ searchParams: Promise.resolve({ motivo: 'sesion' }) }));
    screen.getByText(/Tu sesión terminó/);
    cleanup();
    mostrar(await PaginaIngresar({ searchParams: Promise.resolve({ motivo: 'contrasena' }) }));
    expect(screen.getByText(/Tu contraseña cambió/)).toBeTruthy();
    cleanup();
    for (const motivo of ['<script>', 'constructor', undefined]) {
      mostrar(await PaginaIngresar({ searchParams: Promise.resolve({ motivo }) }));
      expect(screen.queryByRole('status')).toBeNull();
      cleanup();
    }
  });

  it('contrasena, sin permiso y no encontrada se explican', () => {
    mostrar(PaginaContrasena());
    screen.getByText(/se cierran tus sesiones/);
    screen.getByText(/Al menos 12 caracteres/);
    cleanup();
    mostrar(PaginaSinPermiso());
    screen.getByRole('alert');
    screen.getByRole('link', { name: 'inicio' });
    cleanup();
    mostrar(PaginaNoEncontrada());
    expect(screen.getByRole('heading', { name: 'Esta página no existe' })).toBeTruthy();
  });

  it('/salud responde sin detalle', async () => {
    expect(await salud().json()).toEqual({ estado: 'ok' });
  });
});
