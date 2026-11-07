// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaginaDeError from '@/app/error';
import { Aviso } from '@/componentes/aviso';
import { Campo, Casilla, Casillas, Formulario, Selector } from '@/componentes/formulario';
import { Navegacion } from '@/componentes/navegacion';
import { Tabla } from '@/componentes/tabla';
import type { EstadoDeFormulario } from '@/lib/estado';

const ruta = vi.hoisted(() => ({ actual: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => ruta.actual }));

afterEach(cleanup);

const OPCIONES = [
  { valor: 'a', etiqueta: 'Opción A' },
  { valor: 'b', etiqueta: 'Opción B' },
];

function FormularioDePrueba({ resultado }: { resultado: EstadoDeFormulario }) {
  return (
    <Formulario accion={async () => resultado} envio="Guardar">
      <Campo nombre="clave" etiqueta="Clave" ayuda="Como ISW-101." correccion="Usa letras y guion." />
      <Selector nombre="plan" etiqueta="Plan" correccion="Elige un plan." opciones={OPCIONES} />
      <Casillas nombre="roles" etiqueta="Roles" correccion="Marca uno." opciones={OPCIONES} />
    </Formulario>
  );
}

describe('Formulario (28.1)', () => {
  it('todo campo tiene etiqueta asociada, y la ayuda queda descrita', () => {
    render(<FormularioDePrueba resultado={{}} />);
    const clave = screen.getByLabelText('Clave');
    expect(clave.getAttribute('aria-describedby')).toBe(screen.getByText('Como ISW-101.').id);
    expect(clave.getAttribute('aria-invalid')).toBeNull();
    expect(screen.getByLabelText('Plan').tagName).toBe('SELECT');
    expect(screen.getByRole('group', { name: 'Roles' })).toBeTruthy();
  });

  it('un error marca los campos con causa y correccion, lleva el foco al aviso y conserva lo escrito', async () => {
    render(
      <FormularioDePrueba
        resultado={{
          error: 'Revisa los campos marcados.',
          campos: ['clave', 'plan', 'roles'],
          valores: { clave: 'mal/', plan: 'b', roles: ['a'] },
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    const aviso = await screen.findByRole('alert');
    expect(aviso.textContent).toBe('Error: Revisa los campos marcados.');
    await waitFor(() => expect(document.activeElement).toBe(aviso));

    const clave = screen.getByLabelText<HTMLInputElement>('Clave');
    expect(clave.getAttribute('aria-invalid')).toBe('true');
    expect(clave.getAttribute('aria-describedby')).toContain(screen.getByText('Usa letras y guion.').parentElement?.id);
    expect(clave.value).toBe('mal/');
    expect(screen.getByLabelText<HTMLSelectElement>('Plan').value).toBe('b');
    expect(screen.getByLabelText<HTMLInputElement>('Opción A').checked).toBe(true);
    screen.getByText('Elige un plan.');
    screen.getByText('Marca uno.');
  });

  it('el exito se anuncia con texto', async () => {
    render(<FormularioDePrueba resultado={{ exito: 'Creada.' }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect((await screen.findByRole('status')).textContent).toBe('Listo: Creada.');
  });

  it('el boton se desactiva mientras se envia, para no duplicar', async () => {
    let terminar: (estado: EstadoDeFormulario) => void = () => undefined;
    render(
      <Formulario accion={() => new Promise((listo) => (terminar = listo))} envio="Guardar">
        <span />
      </Formulario>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    const enviando = await screen.findByRole<HTMLButtonElement>('button', { name: 'Enviando…' });
    expect(enviando.disabled).toBe(true);
    terminar({});
    await screen.findByRole('button', { name: 'Guardar' });
  });
});

describe('Casillas y Casilla', () => {
  it('respetan lo marcado', () => {
    render(
      <>
        <Casillas nombre="roles" etiqueta="Roles" correccion="x" opciones={OPCIONES} marcadas={['b']} />
        <Casilla nombre="activo" etiqueta="Activa" marcada />
        <Casilla nombre="otra" etiqueta="Otra" />
      </>,
    );
    expect(screen.getByLabelText<HTMLInputElement>('Opción A').checked).toBe(false);
    expect(screen.getByLabelText<HTMLInputElement>('Opción B').checked).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>('Activa').checked).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>('Otra').checked).toBe(false);
  });
});

describe('Aviso (28.1: el estado no depende solo del color)', () => {
  it.each([
    ['error', 'alert', 'Error:'],
    ['exito', 'status', 'Listo:'],
    ['informacion', 'status', 'Aviso:'],
  ] as const)('%s', (tipo, rol, prefijo) => {
    render(<Aviso tipo={tipo}>Texto</Aviso>);
    expect(screen.getByRole(rol).textContent).toBe(`${prefijo} Texto`);
  });
});

describe('Tabla (Tabla 50)', () => {
  const columnas = [
    { titulo: 'Clave', celda: (f: { c: string }) => f.c },
    { titulo: 'Doble', celda: (f: { c: string }) => f.c + f.c },
  ];

  it('conserva los roles y etiqueta cada celda para apilarse en telefono', () => {
    render(<Tabla titulo="Datos" columnas={columnas} filas={[{ c: 'A' }]} clave={(f) => f.c} />);
    expect(screen.getByRole('table', { name: 'Datos' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Doble' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'AA' }).getAttribute('data-etiqueta')).toBe('Doble');
  });

  it('sin filas lo dice', () => {
    render(<Tabla titulo="Datos" columnas={columnas} filas={[]} clave={(f) => f.c} />);
    screen.getByText('Todavía no hay registros.');
    expect(screen.queryByRole('table')).toBeNull();
  });
});

describe('Navegacion', () => {
  it('marca la pagina actual y siempre ofrece Inicio', () => {
    ruta.actual = '/materias';
    render(<Navegacion enlaces={[{ ruta: '/materias', etiqueta: 'Materias', descripcion: '' }]} />);
    expect(screen.getByRole('link', { name: 'Materias' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Inicio' }).getAttribute('aria-current')).toBeNull();
  });
});

describe('Pagina de error', () => {
  it('no muestra detalle tecnico y permite reintentar', async () => {
    const reintentar = vi.fn();
    render(<PaginaDeError reset={reintentar} />);
    screen.getByRole('heading', { name: 'No pudimos cargar esta página' });
    await userEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));
    expect(reintentar).toHaveBeenCalledOnce();
  });
});
