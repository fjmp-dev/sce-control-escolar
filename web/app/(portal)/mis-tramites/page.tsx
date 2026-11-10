import Link from 'next/link';
import { Formulario, Selector } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { solicitarTramite } from '@/lib/acciones';
import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_TIPO_TRAMITE, estadoDeTramite, momentoLegible } from '@/lib/formato';

export const metadata = { title: 'Mis trámites' };

type Tramite = Esquemas['TramiteRespuesta'];

/** RF-007 y RF-010, alumno: solicitar, seguir el estado con su fecha y descargar el documento (Fig. 6). */
export default async function PaginaMisTramites() {
  const tramites = await consultar<Tramite[]>('/alumnos/actual/tramites');
  return (
    <>
      <h1>Mis trámites</h1>
      <h2>Solicitar</h2>
      <Formulario accion={solicitarTramite} envio="Solicitar">
        <Selector
          nombre="tipo"
          etiqueta="Documento"
          correccion="Elige el documento."
          opciones={Object.entries(ETIQUETA_TIPO_TRAMITE).map(([valor, etiqueta]) => ({ valor, etiqueta }))}
        />
      </Formulario>
      <h2>Mis solicitudes</h2>
      <Tabla
        titulo="Mis solicitudes"
        filas={tramites}
        clave={(t) => t.folio}
        columnas={[
          { titulo: 'Folio', celda: (t) => t.folio },
          { titulo: 'Documento', celda: (t) => ETIQUETA_TIPO_TRAMITE[t.tipo] ?? t.tipo },
          { titulo: 'Estado', celda: estadoDeTramite },
          { titulo: 'Solicitado', celda: (t) => momentoLegible(t.fechaSolicitud) },
          { titulo: 'Último cambio', celda: (t) => momentoLegible(t.fechaActualizacion) },
          {
            titulo: 'Descarga',
            celda: (t) =>
              t.documentoFolio ? (
                <Link href={`/mis-tramites/${encodeURIComponent(t.folio)}`}>
                  Descargar<span className="solo-lector"> {t.folio}</span>
                </Link>
              ) : (
                '—'
              ),
          },
        ]}
      />
    </>
  );
}
