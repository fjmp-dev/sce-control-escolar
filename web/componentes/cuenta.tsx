import Link from 'next/link';
import { Tabla } from './tabla';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PAGO, ETIQUETA_MOVIMIENTO, momentoLegible, pesos } from '@/lib/formato';

type Cuenta = Esquemas['EstadoDeCuentaRespuesta'];

const accion = (estado: string) => (estado === 'pendiente' ? 'Continuar el pago' : 'Ver recibo');

/** RF-006: saldo, movimientos y pagos. `enlace` lleva del pago a su pasarela o su recibo (solo el alumno). */
export function EstadoDeCuenta({ cuenta, enlace }: Readonly<{ cuenta: Cuenta; enlace?: (id: number) => string }>) {
  return (
    <>
      <p className="saldo">
        {cuenta.saldo > 0 ? `Adeudo: ${pesos(cuenta.saldo)}` : 'Sin adeudo.'}
        {cuenta.saldo < 0 && ` Saldo a favor: ${pesos(-cuenta.saldo)}.`}
      </p>
      <h2>Movimientos</h2>
      <Tabla
        titulo="Movimientos de la cuenta"
        filas={cuenta.movimientos}
        clave={(m) => String(m.id)}
        columnas={[
          { titulo: 'Fecha', celda: (m) => momentoLegible(m.fecha) },
          { titulo: 'Concepto', celda: (m) => m.concepto },
          { titulo: 'Tipo', celda: (m) => ETIQUETA_MOVIMIENTO[m.tipo] ?? m.tipo },
          { titulo: 'Importe', celda: (m) => pesos(m.importe) },
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
          { titulo: 'Importe', celda: (p) => pesos(p.importe) },
          { titulo: 'Estado', celda: (p) => ETIQUETA_ESTADO_PAGO[p.estado] ?? p.estado },
          ...(enlace
            ? [
                {
                  titulo: 'Detalle',
                  celda: (p: Cuenta['pagos'][number]) =>
                    p.estado === 'pendiente' || p.estado === 'aplicado' ? (
                      <Link href={enlace(p.id)} aria-label={`${accion(p.estado)} ${p.referencia}`}>
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
