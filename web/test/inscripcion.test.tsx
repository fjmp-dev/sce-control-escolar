// @vitest-environment jsdom
// RF-002 y RNF-USU-001 en el portal: estado distinguible por motivo, correccion, comprobante y consulta de control escolar.
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaginaExpediente from '@/app/(portal)/expedientes/[matricula]/page';
import { OfertaDeGrupos } from '@/app/(portal)/inscripcion/oferta';
import PaginaInscripcion from '@/app/(portal)/inscripcion/page';
import { Formulario } from '@/componentes/formulario';
import { BotonImprimir } from '@/componentes/imprimir';
import { estadoDeInscripcion, momentoLegible } from '@/lib/formato';

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

const GRUPO_201 = {
  id: 2,
  clave: 'ISW-201-A',
  materiaClave: 'ISW-201',
  materiaNombre: 'Programación II',
  creditos: 8,
  cupo: 30,
  ocupacion: 3,
  horarios: [
    { dia: 1, horaInicio: '07:00', horaFin: '09:00', aula: 'A1' },
    { dia: 3, horaInicio: '07:00', horaFin: '09:00', aula: 'A1' },
  ],
};
const GRUPO_LLENO = {
  ...GRUPO_201,
  id: 6,
  clave: 'ISW-702-A',
  materiaClave: 'ISW-702',
  materiaNombre: 'Ética profesional',
  creditos: 4,
  cupo: 1,
  ocupacion: 1,
  horarios: [{ dia: 2, horaInicio: '09:00', horaFin: '11:00', aula: 'A2' }],
};
const PUBLICADA = '2026-12-01T15:00:00.000Z';
const PERIODOS = [
  {
    clave: '2027A',
    fechaInicio: '2027-01-12T00:00:00.000Z',
    fechaFin: '2027-06-30T00:00:00.000Z',
    estado: 'abierto',
    ofertaPublicadaEn: PUBLICADA,
  },
  {
    clave: '2026B',
    fechaInicio: '2026-08-03T00:00:00.000Z',
    fechaFin: '2026-12-18T00:00:00.000Z',
    estado: 'cerrado',
    ofertaPublicadaEn: PUBLICADA,
  },
];
const inscripcion = (periodoClave: string, estado: string, motivoRechazo: string | null, grupos = [GRUPO_201]) => ({
  folio: `INS-${periodoClave}-2420001`,
  matricula: '2420001',
  periodoClave,
  estado,
  motivoRechazo,
  fecha: '2027-01-10T16:30:00.000Z',
  grupos,
});
const ANTERIOR = inscripcion('2026B', 'cerrada', null);

function api(respuestas: Record<string, [number, unknown]>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const [estado, cuerpo] = respuestas[url.replace('http://localhost:3001', '')] ?? [
        500,
        { codigo: 'ERROR_INTERNO', mensaje: 'x' },
      ];
      return Response.json(cuerpo, { status: estado });
    }),
  );
}
const alumno = (mias: unknown[], periodos: unknown[] = PERIODOS) =>
  api({
    '/alumnos/actual/inscripciones': [200, mias],
    '/periodos': [200, periodos],
    '/grupos?periodo=2027A': [200, [GRUPO_201, GRUPO_LLENO]],
  });

afterEach(cleanup);

describe('Inscripcion del alumno', () => {
  it('CC-012: con el periodo abierto pero la oferta sin publicar, lo explica y no ofrece armar la carga', async () => {
    alumno([], [{ ...PERIODOS[0], ofertaPublicadaEn: null }]);
    render(await PaginaInscripcion());
    screen.getByText(/La oferta de 2027A todavía no se publica/);
    expect(screen.queryByRole('heading', { name: 'Arma tu carga' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Enviar carga' })).toBeNull();
  });

  it('sin inscripcion en el periodo: oferta con horario y lugares, revisar choques y enviar', async () => {
    alumno([ANTERIOR]);
    render(await PaginaInscripcion());
    expect(screen.getByRole('heading', { name: 'Inscripción 2027A' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Arma tu carga' })).toBeTruthy();
    const oferta = screen.getByRole('group', { name: 'Oferta de 2027A' });
    within(oferta).getByLabelText(
      /ISW-201 Programación II, grupo ISW-201-A: Lunes de 07:00 a 09:00, aula\sA1; Miércoles.*27 lugares/,
    );
    within(oferta).getByLabelText(/ISW-702 Ética profesional.*Sin lugares/);
    expect(screen.getByRole('button', { name: 'Revisar choques' }).getAttribute('name')).toBe('intencion');
    screen.getByRole('button', { name: 'Enviar carga' });
    expect(document.querySelector<HTMLInputElement>('input[name=periodoClave]')?.value).toBe('2027A');
    expect(screen.queryByRole('heading', { name: 'Comprobante de inscripción' })).toBeNull();
    expect(screen.getByRole('cell', { name: 'Cerrada' })).toBeTruthy();
  });

  it.each([
    ['prerrequisito', 'Rechazada por prerrequisito faltante', 'Quita de tu carga la materia'],
    ['adeudo', 'Rechazada por adeudo', 'Liquida tu adeudo en caja'],
    ['choque', 'Rechazada por choque de horario', 'Cambia uno de los grupos'],
    ['cupo', 'Rechazada por grupo sin cupo', 'Elige otro grupo'],
  ])(
    'CF-INS-02: rechazada por %s tiene estado y correccion propios, y conserva la carga',
    async (motivo, estado, que) => {
      alumno([inscripcion('2027A', 'rechazada', motivo)]);
      render(await PaginaInscripcion());
      expect(screen.getByText(estado)).toBeTruthy();
      expect(screen.getByText(new RegExp(que))).toBeTruthy();
      expect(screen.getByLabelText<HTMLInputElement>(/ISW-201 Programación II/).checked).toBe(true);
      expect(screen.getByLabelText<HTMLInputElement>(/ISW-702/).checked).toBe(false);
      screen.getByRole('button', { name: 'Enviar carga' });
    },
  );

  it('confirmada: comprobante con folio, creditos y carga, boton de imprimir y ajuste con el folio', async () => {
    alumno([inscripcion('2027A', 'confirmada', null, [GRUPO_201, GRUPO_LLENO])]);
    render(await PaginaInscripcion());
    const comprobante = screen.getByRole('region', { name: 'Comprobante de inscripción' });
    within(comprobante).getByText('INS-2027A-2420001');
    within(comprobante).getByText('12');
    within(comprobante).getByRole('cell', { name: 'ISW-702 · Ética profesional' });
    screen.getByRole('button', { name: 'Imprimir comprobante' });
    screen.getByRole('heading', { name: 'Ajustar tu carga' });
    screen.getByRole('button', { name: 'Ajustar carga' });
    expect(document.querySelector<HTMLInputElement>('input[name=folio]')?.value).toBe('INS-2027A-2420001');
    expect(document.querySelector('input[name=periodoClave]')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Inscripciones anteriores' })).toBeNull();
  });

  it('con varios periodos abiertos, inscribe en el que empieza antes', async () => {
    alumno([], [{ ...PERIODOS[0], clave: '2680A', fechaInicio: '2680-01-10T00:00:00.000Z' }, ...PERIODOS]);
    render(await PaginaInscripcion());
    expect(screen.getByRole('heading', { name: 'Inscripción 2027A' })).toBeTruthy();
  });

  it('sin periodo abierto lo dice y muestra las inscripciones anteriores', async () => {
    alumno([ANTERIOR], [PERIODOS[1]]);
    render(await PaginaInscripcion());
    expect(screen.getByRole('heading', { name: 'Inscripción' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('No hay un periodo de inscripción abierto');
    expect(screen.queryByRole('button', { name: 'Enviar carga' })).toBeNull();
    screen.getByRole('heading', { name: 'Inscripciones anteriores' });
  });

  it('sin expediente vinculado explica que hacer', async () => {
    api({
      '/alumnos/actual/inscripciones': [404, { codigo: 'SIN_EXPEDIENTE', mensaje: 'Acude a control escolar.' }],
    });
    render(await PaginaInscripcion());
    expect(screen.getByRole('status').textContent).toContain('Acude a control escolar');
  });

  it('otros errores llegan a la pagina de error', async () => {
    api({});
    await expect(PaginaInscripcion()).rejects.toThrow();
  });
});

describe('Oferta en tarjetas', () => {
  it('tras un rechazo de validacion conserva lo elegido, marca el campo y dice el lugar en singular', async () => {
    const accion = async () => ({ error: 'Revisa la carga.', campos: ['grupos'], valores: { grupos: ['6'] } });
    render(
      <Formulario accion={accion} envio="Enviar carga">
        <OfertaDeGrupos periodo="2027A" oferta={[GRUPO_201, { ...GRUPO_LLENO, cupo: 2 }]} marcadas={[]} />
      </Formulario>,
    );
    screen.getByLabelText(/ISW-702 Ética profesional.*1 lugar$/);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar carga' }));
    const error = await screen.findByText(/Elige al menos un grupo/);
    expect(screen.getByRole('group', { name: 'Oferta de 2027A' }).getAttribute('aria-describedby')).toBe(error.id);
    expect(screen.getByLabelText<HTMLInputElement>(/ISW-702/).checked).toBe(true);
    expect(screen.getByLabelText<HTMLInputElement>(/ISW-201/).checked).toBe(false);
  });
});

describe('Control escolar consulta las inscripciones (D-14)', () => {
  it('ve periodo, folio, estado distinguible y carga, sin formularios de inscripcion', async () => {
    api({
      '/alumnos/2420001': [
        200,
        {
          matricula: '2420001',
          nombre: 'Alumno Sintético Uno',
          facultadClave: 'CUTG',
          facultadNombre: 'Centro',
          estatus: 'activo',
          fechaIngreso: '2024-08-05T00:00:00.000Z',
          correo: null,
          historial: { promedio: 0, creditosAcumulados: 0, avance: 0 },
          trayectoria: [],
        },
      ],
      '/facultades': [200, [{ clave: 'CUTG', nombre: 'Centro' }]],
      '/alumnos/2420001/inscripciones': [200, [inscripcion('2027A', 'rechazada', 'adeudo'), ANTERIOR]],
      '/alumnos/2420001/calificaciones': [
        200,
        { matricula: '2420001', historial: { promedio: 0, creditosAcumulados: 0, avance: 0 }, materias: [] },
      ],
    });
    render(await PaginaExpediente({ params: Promise.resolve({ matricula: '2420001' }) }));
    screen.getByRole('cell', { name: 'Rechazada por adeudo' });
    screen.getByRole('cell', { name: 'INS-2026B-2420001' });
    expect(screen.getAllByRole('cell', { name: 'ISW-201 grupo ISW-201-A' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Enviar carga' })).toBeNull();
  });
});

describe('Comprobante e imprimir', () => {
  it('imprime con el dialogo del navegador', () => {
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<BotonImprimir />);
    fireEvent.click(screen.getByRole('button', { name: 'Imprimir comprobante' }));
    expect(imprimir).toHaveBeenCalledOnce();
  });

  it('estado sin motivo conocido cae a la etiqueta del estado, y la fecha va en hora del centro', () => {
    expect(estadoDeInscripcion('ajustada', null)).toBe('Ajustada');
    expect(estadoDeInscripcion('rara', null)).toBe('rara');
    expect(estadoDeInscripcion('rechazada', 'otro')).toBe('Rechazada');
    expect(momentoLegible('2027-01-10T16:30:00.000Z')).toMatch(/10:30/);
  });
});
