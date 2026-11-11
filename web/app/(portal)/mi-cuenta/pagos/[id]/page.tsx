import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Aviso } from '@/componentes/aviso';
import { Formulario } from '@/componentes/formulario';
import { Logotipo } from '@/componentes/icono';
import { BotonImprimir } from '@/componentes/imprimir';
import { Insignia, tonoDeEstado } from '@/componentes/insignia';
import { simularPago } from '@/lib/acciones';
import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PAGO, momentoLegible, pesos } from '@/lib/formato';

export const metadata = { title: 'Pago' };

const volver = (
  <Link href="/mi-cuenta" className="boton boton-secundario">
    Volver a mi cuenta
  </Link>
);

/** Pasarela simulada y recibo. El pago se busca en la cuenta del alumno: uno ajeno no existe aquí. */
export default async function PaginaPago({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const cuenta = await consultar<Esquemas['EstadoDeCuentaRespuesta']>('/alumnos/actual/cuenta');
  const pago = cuenta.pagos.find((p) => String(p.id) === id);
  if (!pago) notFound();
  if (pago.estado === 'aplicado') {
    return (
      <>
        <section aria-labelledby="titulo-recibo" className="tarjeta cuenta-recibo">
          <p className="marca">
            <Logotipo />
            Sistema de Control Escolar
          </p>
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
            <dt>Estado</dt>
            <dd>
              <Insignia tono={tonoDeEstado(pago.estado)}>{ETIQUETA_ESTADO_PAGO[pago.estado]}</Insignia>
            </dd>
            <dt>Saldo después del pago</dt>
            <dd>{pesos(cuenta.saldo)}</dd>
          </dl>
        </section>
        <p className="botones no-imprimir">
          <BotonImprimir etiqueta="Imprimir recibo" />
          {volver}
        </p>
      </>
    );
  }
  return (
    <>
      <h1>Pasarela de pago</h1>
      {pago.estado === 'pendiente' ? (
        <Formulario
          accion={simularPago}
          envio="Aprobar el pago"
          alterno={{ valor: 'rechazado', etiqueta: 'Rechazar el pago' }}
        >
          <input type="hidden" name="id" value={pago.id} />
          <dl className="datos">
            <dt>Referencia</dt>
            <dd>{pago.referencia}</dd>
            <dt>Importe</dt>
            <dd>{pesos(pago.importe)}</dd>
          </dl>
          <Aviso tipo="informacion">
            Este sistema no cobra con dinero real: aquí eliges la respuesta que daría el banco.
          </Aviso>
        </Formulario>
      ) : (
        <Aviso tipo="error">
          El banco rechazó el pago {pago.referencia} por {pesos(pago.importe)}. No se cobró nada; puedes intentarlo de
          nuevo.
        </Aviso>
      )}
      <p>{volver}</p>
    </>
  );
}
