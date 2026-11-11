// Batch 9 sin base de datos: Pago.aplicarUnaVez (R-14), el abono que no rebasa el saldo (#69) y las transiciones del
// tramite (Fig. 6, R-16).
import { ErrorDeNegocio } from '../../src/dominio/error-de-negocio';
import { CuentaAlumno } from '../../src/pagos/dominio/cuenta-alumno';
import { EstadoPago, Pago } from '../../src/pagos/dominio/pago';
import { EstadoTramite, huella, redactar, Tramite } from '../../src/tramites/dominio/tramite';

const codigo = (accion: () => unknown) => {
  try {
    accion();
  } catch (error) {
    return (error as ErrorDeNegocio).codigo;
  }
  return undefined;
};

describe('R-14: Pago.aplicarUnaVez', () => {
  it('pendiente se aplica una vez; el segundo aviso no hace nada', () => {
    const pago = new Pago('pendiente');
    expect(pago.aplicarUnaVez()).toBe(true);
    expect(pago.aplicarUnaVez()).toBe(false);
    expect(pago.estado).toBe('aplicado');
  });

  it.each(['rechazado', 'cancelado'] as EstadoPago[])('un pago %s nunca se aplica', (estado) => {
    expect(codigo(() => new Pago(estado).aplicarUnaVez())).toBe('PAGO_NO_APLICABLE');
  });

  it('rechazar: solo un pendiente; repetirlo no cambia nada; uno aplicado no se rechaza', () => {
    const pago = new Pago('pendiente');
    pago.rechazar();
    pago.rechazar();
    expect(pago.estado).toBe('rechazado');
    expect(codigo(() => new Pago('aplicado').rechazar())).toBe('PAGO_NO_APLICABLE');
  });
});

describe('CuentaAlumno.admiteAbono (#69)', () => {
  it.each([
    [1850, 1850, true],
    [1850, 1850.01, false],
    [0, 0.01, false],
    [0.1 + 0.2, 0.3, true],
    [0.3, 0.1 + 0.2, true], // en coma flotante, 0.1 + 0.2 > 0.3
  ])('saldo %p, abono %p: %p', (saldo, importe, admite) => {
    expect(new CuentaAlumno(saldo).admiteAbono(importe)).toBe(admite);
  });
});

describe('Pago.aprobar (#69, CI-PAG-01)', () => {
  it('pendiente que cabe en el saldo: se aplica una vez', () => {
    const pago = new Pago('pendiente');
    expect(pago.aprobar(true)).toBe(true);
    expect(pago.aprobar(false)).toBe(false); // aviso repetido de un pago ya aplicado: no hace nada
    expect(pago.estado).toBe('aplicado');
  });

  it('pendiente que ya no cabe: se rechaza y no se aplica', () => {
    const pago = new Pago('pendiente');
    expect(pago.aprobar(false)).toBe(false);
    expect(pago.estado).toBe('rechazado');
    expect(codigo(() => pago.aprobar(true))).toBe('PAGO_NO_APLICABLE');
  });

  it.each(['rechazado', 'cancelado'] as EstadoPago[])('un pago %s nunca se aprueba', (estado) => {
    expect(codigo(() => new Pago(estado).aprobar(true))).toBe('PAGO_NO_APLICABLE');
  });
});

describe('R-16: Tramite, Fig. 6', () => {
  const desde = (estado: EstadoTramite) => new Tramite(estado);

  it('recibida, en proceso, lista y entregada; la segunda descarga no cambia nada', () => {
    const t = desde('recibida');
    t.tomar();
    t.emitir();
    expect(t.entregar()).toBe(true);
    expect(t.entregar()).toBe(false);
    expect(t.estado).toBe('entregada');
  });

  it('el rechazo solo sale de en proceso y guarda el motivo', () => {
    const t = desde('en_proceso');
    t.rechazar('Falta el historial');
    expect([t.estado, t.motivo]).toEqual(['rechazada', 'Falta el historial']);
  });

  it.each([
    ['recibida', (t: Tramite) => t.emitir()],
    ['recibida', (t: Tramite) => t.rechazar('x')],
    ['lista', (t: Tramite) => t.rechazar('x')],
    ['en_proceso', (t: Tramite) => t.entregar()],
    ['rechazada', (t: Tramite) => t.tomar()],
    ['entregada', (t: Tramite) => t.emitir()],
  ] as [EstadoTramite, (t: Tramite) => unknown][])('desde %s no se salta la Fig. 6', (estado, paso) => {
    expect(codigo(() => paso(desde(estado)))).toBe('TRAMITE_TRANSICION_INVALIDA');
  });
});

describe('Documento emitido', () => {
  const datos = {
    folio: 'DOC-1',
    matricula: '2420001',
    nombre: 'Alumno Sintético Uno',
    facultad: 'Centro Universitario',
    estatus: 'activo',
    promedio: 8.17,
    creditos: 8,
    avance: 2,
    saldo: 0,
    materias: [
      { periodo: '2026A', clave: 'ISW-101', nombre: 'Programación I', creditos: 8, final: 8.17, acreditada: true },
    ],
    emitidoEl: new Date('2026-11-10T18:00:00Z'),
  };

  it('cada tipo dice lo suyo, con el folio y la fecha en la hora del centro de Mexico', () => {
    expect(redactar('constancia', datos)).toContain('CONSTANCIA DE ESTUDIOS');
    expect(redactar('no_adeudo', datos)).toContain('no tiene adeudos');
    expect(redactar('historial', datos)).toContain('2026A | ISW-101 Programación I | 8 | 8.17 | Acreditada');
    expect(redactar('constancia', datos)).toContain('Folio: DOC-1');
    expect(redactar('constancia', datos)).toContain('10 de noviembre de 2026');
  });

  it('el hash cambia si cambia una letra', () => {
    const texto = redactar('constancia', datos);
    expect(huella(texto)).toMatch(/^[0-9a-f]{64}$/);
    expect(huella(texto)).toBe(huella(texto));
    expect(huella(`${texto} `)).not.toBe(huella(texto));
  });
});
