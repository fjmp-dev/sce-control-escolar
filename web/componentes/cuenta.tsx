import Link from 'next/link';
import type { ReactNode } from 'react';
import { Insignia, tonoDeEstado } from './insignia';
import { Tabla } from './tabla';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PAGO, ETIQUETA_MOVIMIENTO, momentoLegible, pesos } from '@/lib/formato';

type Cuenta = Esquemas['EstadoDeCuentaRespuesta'];

const accion = (estado: string) => (estado === 'pendiente' ? 'Continuar el pago' : 'Ver recibo');

/**
 * RF-006: saldo, movimientos y pagos. `enlace` lleva del pago a su pasarela o su recibo (solo el alumno).
 * `children` va justo después del saldo: pagar en mi cuenta, registrar una beca en caja.
 */
export function EstadoDeCuenta({
  cuenta,
  enlace,
  children,
}: Readonly<{ cuenta: Cuenta; enlace?: (id: number) => string; children?: ReactNode }>) {
  const [etiqueta, valor] =
    cuenta.saldo > 0
      ? ['Adeudo', pesos(cuenta.saldo)]
      : cuenta.saldo < 0
        ? ['Saldo a favor', pesos(-cuenta.saldo)]
        : ['Saldo', 'Sin adeudo.'];
  return (
    <>
      <p className={`saldo ${cuenta.saldo > 0 ? 'saldo-adeudo' : 'saldo-al-corriente'}`}>
        <span className="cifra-etiqueta">
          {etiqueta}
          <span className="solo-lector">:</span>
        </span>{' '}
        <span className="cifra-valor">{valor}</span>
      </p>
      {children}
      <h2>Movimientos</h2>
      <Tabla
        titulo="Movimientos de la cuenta"
        filas={cuenta.movimientos}
        clave={(m) => String(m.id)}
        columnas={[
          { titulo: 'Fecha', celda: (m) => momentoLegible(m.fecha) },
          { titulo: 'Concepto', celda: (m) => m.concepto },
          { titulo: 'Tipo', celda: (m) => ETIQUETA_MOVIMIENTO[m.tipo] ?? m.tipo },
          { titulo: 'Importe', celda: (m) => pesos(m.importe), numerica: true },
        ]}
      />
      <h2>Pagos en línea</h2>
      <Tabla
        titulo="Pagos en línea"
        filas={cuenta.pagos}
        clave={(p) => String(p.id)}
        columnas={[
          { titulo: 'Referencia', celda: (p) => p.referencia },
          { titulo: 'Fecha', celda: (p) => momentoLegible(p.fecha) },
          { titulo: 'Importe', celda: (p) => pesos(p.importe), numerica: true },
          {
            titulo: 'Estado',
            celda: (p) => (
              <Insignia tono={tonoDeEstado(p.estado)}>{ETIQUETA_ESTADO_PAGO[p.estado] ?? p.estado}</Insignia>
            ),
          },
          ...(enlace
            ? [
                {
                  titulo: 'Detalle',
                  celda: (p: Cuenta['pagos'][number]) =>
                    p.estado === 'pendiente' || p.estado === 'aplicado' ? (
                      <Link
                        href={enlace(p.id)}
                        className="boton boton-secundario"
                        aria-label={`${accion(p.estado)} ${p.referencia}`}
                      >
                        {accion(p.estado)}
                      </Link>
                    ) : (
                      '—'
                    ),
                },
              ]
            : []),
        ]}
      />
    </>
  );
}
