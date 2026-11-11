// @vitest-environment jsdom
// RF-006, RF-007 y RF-010 en el portal (Batch 9): mi cuenta con pasarela simulada y recibo, caja, mis tramites,
// descarga del documento y cola de control escolar con verificacion.
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PaginaCaja from '@/app/(portal)/caja/page';
import PaginaMiCuenta from '@/app/(portal)/mi-cuenta/page';
import PaginaPago from '@/app/(portal)/mi-cuenta/pagos/[id]/page';
import PaginaDocumento from '@/app/(portal)/mis-tramites/[folio]/page';
import PaginaMisTramites from '@/app/(portal)/mis-tramites/page';
import PaginaTramites from '@/app/(portal)/tramites/page';
import { momentoLegible } from '@/lib/formato';

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

const FECHA = '2026-11-10T16:00:00.000Z';
const pago = (id: number, estado: string) => ({
  id,
  matricula: '2420002',
  referencia: `REF-${id}`,
  importe: 500,
  estado,
  fecha: FECHA,
  aplicadoEn: estado === 'aplicado' ? FECHA : null,
});
const cuenta = (saldo: number) => ({
  matricula: '2420002',
  saldo,
  movimientos: [{ id: 1, concepto: 'Inscripción 2027A', importe: 1850, tipo: 'cargo', fecha: FECHA }],
  pagos: [pago(1, 'pendiente'), pago(2, 'aplicado'), pago(3, 'rechazado')],
});
const tramite = (folio: string, estado: string, extra: Record<string, unknown> = {}) => ({
  folio,
  matricula: '2420002',
  tipo: 'no_adeudo',
  estado,
  motivoRechazo: null,
  fechaSolicitud: FECHA,
  fechaActualizacion: FECHA,
  documentoFolio: null,
  ...extra,
});
const DOCUMENTO = {
  folio: 'DOC-2420002-A',
  tramiteFolio: 'TRA-2420002-A',
  tipo: 'no_adeudo',
  contenido: 'CONSTANCIA DE NO ADEUDO\nno tiene adeudos',
  hash: 'a'.repeat(64),
  fechaEmision: FECHA,
};

function api(respuestas: Record<string, unknown>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const ruta = url.replace('http://localhost:3001', '');
      return ruta in respuestas
        ? Response.json(respuestas[ruta])
        : Response.json({ codigo: 'NO_ENCONTRADO', mensaje: ruta }, { status: 404 });
    }),
  );
}
const parametros = <T,>(valor: T) => Promise.resolve(valor);

afterEach(cleanup);

describe('Mi cuenta y pasarela simulada (RF-006)', () => {
  it('con adeudo ofrece pagar y lleva de cada pago a su pasarela o su recibo', async () => {
    api({ '/alumnos/actual/cuenta': cuenta(1850) });
    render(await PaginaMiCuenta());
    expect(document.querySelector('.saldo')?.textContent).toBe('Adeudo: $1,850.00');
    screen.getByRole('button', { name: 'Ir a pagar' });
    within(screen.getByRole('table', { name: 'Movimientos de la cuenta' })).getByRole('cell', { name: 'Cargo' });
    expect(screen.getByRole('link', { name: 'Continuar el pago REF-1' }).getAttribute('href')).toBe(
      '/mi-cuenta/pagos/1',
    );
    expect(screen.getByRole('link', { name: 'Ver recibo REF-2' }).getAttribute('href')).toBe('/mi-cuenta/pagos/2');
    within(screen.getByRole('row', { name: /REF-3/ })).getByRole('cell', { name: 'Rechazado' });
  });

  it('sin adeudo no ofrece pagar', async () => {
    api({ '/alumnos/actual/cuenta': cuenta(0) });
    render(await PaginaMiCuenta());
    screen.getByText('Sin adeudo.');
    expect(screen.queryByRole('button', { name: 'Ir a pagar' })).toBeNull();
  });

  it('pendiente: la pasarela aprueba o rechaza; aplicado: recibo; rechazado: lo dice; ajeno: no existe', async () => {
    api({ '/alumnos/actual/cuenta': cuenta(1350) });
    render(await PaginaPago({ params: parametros({ id: '1' }) }));
    screen.getByRole('button', { name: 'Aprobar el pago' });
    screen.getByRole('button', { name: 'Rechazar el pago' });
    cleanup();

    render(await PaginaPago({ params: parametros({ id: '2' }) }));
    screen.getByRole('heading', { name: 'Recibo de pago' });
    screen.getByRole('button', { name: 'Imprimir recibo' });
    screen.getByText('$1,350.00');
    cleanup();

    render(await PaginaPago({ params: parametros({ id: '3' }) }));
    expect(screen.getByRole('alert').textContent).toContain('El banco rechazó el pago');
    await expect(PaginaPago({ params: parametros({ id: '99' }) })).rejects.toThrow('NO_ENCONTRADO');
  });
});

describe('Caja (RF-006, Fig. 7)', () => {
  const COMUNES = {
    '/periodos': [{ clave: '2027A', estado: 'abierto', fechaInicio: FECHA, fechaFin: FECHA }],
    '/pagos?fecha=2026-11-10': { fecha: '2026-11-10', pagos: [pago(2, 'aplicado')], total: 500 },
  };

  it('corte del dia con su total y cargos del periodo, sin buscar a nadie', async () => {
    api(COMUNES);
    render(await PaginaCaja({ searchParams: parametros({ fecha: '2026-11-10' }) }));
    within(screen.getByRole('table', { name: 'Pagos aplicados el 2026-11-10' })).getByRole('cell', { name: 'REF-2' });
    expect(screen.getByText('Total del día').closest('.saldo')?.textContent).toBe('Total del día$500.00');
    screen.getByRole('option', { name: '2027A (Abierto)' });
    expect(screen.queryByRole('button', { name: 'Registrar la beca' })).toBeNull();
  });

  it('el estado de cuenta de una matricula con adeudo ofrece la beca; una matricula que no existe lo explica', async () => {
    api({ ...COMUNES, '/alumnos/2420002/cuenta': cuenta(1850) });
    render(await PaginaCaja({ searchParams: parametros({ matricula: '2420002', fecha: '2026-11-10' }) }));
    expect(document.querySelector('.saldo')?.textContent).toBe('Adeudo: $1,850.00');
    screen.getByRole('button', { name: 'Registrar la beca' });
    cleanup();

    render(await PaginaCaja({ searchParams: parametros({ matricula: '9999999', fecha: '2026-11-10' }) }));
    expect(screen.getByRole('alert').textContent).toContain('No hay un expediente con la matrícula 9999999');
  });
});

describe('Tramites (RF-007, RF-010, Fig. 6)', () => {
  it('R-16: el alumno ve el estado con la fecha de solicitud y del último cambio, el motivo del rechazo y la descarga cuando esta listo', async () => {
    const CAMBIO = '2026-11-12T18:30:00.000Z';
    api({
      '/alumnos/actual/tramites': [
        tramite('TRA-A', 'lista', { documentoFolio: 'DOC-A' }),
        tramite('TRA-B', 'rechazada', {
          tipo: 'constancia',
          motivoRechazo: 'Faltan datos',
          fechaActualizacion: CAMBIO,
        }),
      ],
    });
    render(await PaginaMisTramites());
    screen.getByRole('button', { name: 'Solicitar' });
    expect(screen.getByRole('link', { name: 'Descargar TRA-A' }).getAttribute('href')).toBe('/mis-tramites/TRA-A');
    const rechazado = within(screen.getByRole('row', { name: /TRA-B/ }));
    rechazado.getByRole('cell', { name: 'Rechazada: Faltan datos' });
    expect(rechazado.getByRole('cell', { name: momentoLegible(FECHA) })).toBeTruthy();
    expect(rechazado.getByRole('cell', { name: momentoLegible(CAMBIO) })).toBeTruthy();
  });

  it('el documento se muestra con su huella; uno que no esta listo no existe', async () => {
    api({ '/tramites/TRA-2420002-A/documento': DOCUMENTO });
    render(await PaginaDocumento({ params: parametros({ folio: 'TRA-2420002-A' }) }));
    expect(screen.getByText(/no tiene adeudos/).tagName).toBe('PRE');
    screen.getByText('a'.repeat(64));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ codigo: 'TRAMITE_TRANSICION_INVALIDA', mensaje: 'x' }, { status: 409 })),
    );
    await expect(PaginaDocumento({ params: parametros({ folio: 'TRA-X' }) })).rejects.toThrow('NO_ENCONTRADO');
  });

  it('control escolar: tomar lo recibido, emitir o rechazar lo que esta en proceso, y el resultado confirmado', async () => {
    api({
      '/tramites': [tramite('TRA-R', 'recibida'), tramite('TRA-P', 'en_proceso'), tramite('TRA-L', 'lista')],
    });
    render(await PaginaTramites({ searchParams: parametros({ hecho: 'proceso', folio: 'TRA-P' }) }));
    screen.getByText(/El trámite TRA-P quedó en proceso/);
    within(screen.getByRole('row', { name: /TRA-R/ })).getByRole('button', { name: 'Tomar' });
    const enProceso = within(screen.getByRole('row', { name: /TRA-P/ }));
    enProceso.getByRole('button', { name: 'Emitir' });
    enProceso.getByLabelText('Motivo del rechazo');
    expect(screen.queryByRole('row', { name: /TRA-L/ })).toBeNull(); // el filtro por omision son los pendientes
    cleanup();

    render(await PaginaTramites({ searchParams: parametros({ filtro: 'lista', hecho: 'emision', folio: 'TRA-P' }) }));
    expect(screen.queryByText(/quedó listo/)).toBeNull(); // la API dice que sigue en proceso: no se presume
    screen.getByRole('row', { name: /TRA-L/ });
  });

  it('la verificacion distingue un documento autentico de uno alterado o inexistente', async () => {
    api({ '/tramites': [], '/documentos/DOC-1': { ...DOCUMENTO, folio: 'DOC-1', matricula: '2420002', valido: true } });
    render(await PaginaTramites({ searchParams: parametros({ documento: 'DOC-1' }) }));
    screen.getByText(/El documento DOC-1 es auténtico/);
    cleanup();

    api({
      '/tramites': [],
      '/documentos/DOC-2': { ...DOCUMENTO, folio: 'DOC-2', matricula: '2420002', valido: false },
    });
    render(await PaginaTramites({ searchParams: parametros({ documento: 'DOC-2' }) }));
    expect(screen.getByRole('alert').textContent).toContain('fue alterado');
    cleanup();

    render(await PaginaTramites({ searchParams: parametros({ documento: 'DOC-9' }) }));
    expect(screen.getByRole('alert').textContent).toContain('No hay un documento con el folio DOC-9');
  });
});
