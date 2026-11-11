import { Insignia, tonoDeEstado } from '@/componentes/insignia';
import type { Esquemas } from '@/lib/contrato';
import { estadoDeTramite, momentoLegible } from '@/lib/formato';

/** Fig. 6: el estado en insignia; el rechazo, con su motivo en texto (los dos puntos solo los oye el lector). */
export function EstadoDeTramite({ tramite }: Readonly<{ tramite: Esquemas['TramiteRespuesta'] }>) {
  if (tramite.estado !== 'rechazada') {
    return <Insignia tono={tonoDeEstado(tramite.estado)}>{estadoDeTramite(tramite)}</Insignia>;
  }
  return (
    <>
      <Insignia tono="error">Rechazada</Insignia>
      <span className="solo-lector">:</span> <span className="tramites-motivo">{tramite.motivoRechazo}</span>
    </>
  );
}

export const Momento = ({ iso }: Readonly<{ iso: string }>) => <time dateTime={iso}>{momentoLegible(iso)}</time>;

/** RF-010: el documento como hoja, con el sello que permite verificarlo (folio, emisión y huella). */
export function Hoja({ documento }: Readonly<{ documento: Esquemas['DocumentoRespuesta'] }>) {
  return (
    <article className="tramites-hoja">
      <pre className="documento">{documento.contenido}</pre>
      <dl className="datos tramites-sello">
        <dt>Folio</dt>
        <dd className="folio">{documento.folio}</dd>
        <dt>Emitido</dt>
        <dd>
          <Momento iso={documento.fechaEmision} />
        </dd>
        <dt>Huella SHA-256</dt>
        <dd>
          <code>{documento.hash}</code>
        </dd>
      </dl>
    </article>
  );
}
