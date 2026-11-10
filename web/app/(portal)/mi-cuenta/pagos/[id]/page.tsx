import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Aviso } from '@/componentes/aviso';
import { Formulario } from '@/componentes/formulario';
import { BotonImprimir } from '@/componentes/imprimir';
import { simularPago } from '@/lib/acciones';
import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { momentoLegible, pesos } from '@/lib/formato';

export const metadata = { title: 'Pago' };

/** Pasarela simulada y recibo. El pago se busca en la cuenta del alumno: uno ajeno no existe aquí. */
export default async function PaginaPago({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const cuenta = await consultar<Esquemas['EstadoDeCuentaRespuesta']>('/alumnos/actual/cuenta');
  const pago = cuenta.pagos.find((p) => String(p.id) === id);
  if (!pago) notFound();
  if (pago.estado === 'aplicado') {
    return (
      <section aria-labelledby="titulo-recibo">
        <h1 id="titulo-recibo">Recibo de pago</h1>
        <dl className="datos">
          <dt>Referencia</dt>
          <dd>{pago.referencia}</dd>
          <dt>Matrícula</dt>
          <dd>{pago.matricula}</dd>
          <dt>Importe</dt>
          <dd>{pesos(pago.importe)}</dd>
          <dt>Pagado el</dt>
          <dd>{momentoLegible(pago.aplicadoEn ?? pago.fecha)}</dd>
          <dt>Saldo después del pago</dt>
          <dd>{pesos(cuenta.saldo)}</dd>
        </dl>
        <BotonImprimir etiqueta="Imprimir recibo" />
        <p className="no-imprimir">
          <Link href="/mi-cuenta">Volver a mi cuenta</Link>
        </p>
      </section>
    );
  }
  return (
    <>
      <h1>Pasarela de pago</h1>
      <p>
        Referencia {pago.referencia} por {pesos(pago.importe)}.
      </p>
      {pago.estado === 'pendiente' ? (
        <>
          <Aviso tipo="informacion">
            Este sistema no cobra con dinero real: aquí eliges la respuesta que daría el banco.
          </Aviso>
          <Formulario
            accion={simularPago}
            envio="Aprobar el pago"
            alterno={{ valor: 'rechazado', etiqueta: 'Rechazar el pago' }}
          >
            <input type="hidden" name="id" value={pago.id} />
          </Formulario>
        </>
      ) : (
        <Aviso tipo="error">El banco rechazó el pago. No se cobró nada; puedes intentarlo de nuevo.</Aviso>
      )}
      <p>
        <Link href="/mi-cuenta">Volver a mi cuenta</Link>
      </p>
    </>
  );
}
