import Link from 'next/link';
import { EstadoDeTramite, Momento } from '@/app/(portal)/tramites/piezas';
import { Formulario, Selector } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { solicitarTramite } from '@/lib/acciones';
import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_TIPO_TRAMITE } from '@/lib/formato';

export const metadata = { title: 'Mis trámites' };

type Tramite = Esquemas['TramiteRespuesta'];

/** RF-007 y RF-010, alumno: solicitar, seguir el estado con su fecha y descargar el documento (Fig. 6). */
export default async function PaginaMisTramites() {
  const tramites = await consultar<Tramite[]>('/alumnos/actual/tramites');
  return (
    <>
      <h1>Mis trámites</h1>
      <p className="entrada">
        Pide tus constancias y tu historial, y sigue su estado. Cuando un documento esté listo, descárgalo aquí.
      </p>
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
          { titulo: 'Folio', celda: (t) => <span className="folio">{t.folio}</span> },
          { titulo: 'Documento', celda: (t) => ETIQUETA_TIPO_TRAMITE[t.tipo] ?? t.tipo },
          { titulo: 'Estado', celda: (t) => <EstadoDeTramite tramite={t} /> },
          { titulo: 'Solicitado', celda: (t) => <Momento iso={t.fechaSolicitud} /> },
          { titulo: 'Último cambio', celda: (t) => <Momento iso={t.fechaActualizacion} /> },
          {
            titulo: 'Descarga',
            celda: (t) =>
              t.documentoFolio ? (
                <Link
                  href={`/mis-tramites/${encodeURIComponent(t.folio)}`}
                  aria-label={`Descargar ${t.folio}`}
                  className="boton boton-secundario"
                >
                  Descargar
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
