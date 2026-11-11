import { Aviso } from '@/componentes/aviso';
import { Campo, Formulario } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { emitirTramite, rechazarTramite, tomarTramite } from '@/lib/acciones';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_TIPO_TRAMITE, estadoDeTramite, momentoLegible } from '@/lib/formato';

export const metadata = { title: 'Trámites' };

type Tramite = Esquemas['TramiteRespuesta'];

const FILTROS: Record<string, { etiqueta: string; estados: string[] }> = {
  pendientes: { etiqueta: 'Pendientes', estados: ['recibida', 'en_proceso'] },
  lista: { etiqueta: 'Listos para descargar', estados: ['lista'] },
  cerrados: { etiqueta: 'Entregados y rechazados', estados: ['entregada', 'rechazada'] },
};

const HECHO: Record<string, { estado: string; mensaje: string }> = {
  proceso: { estado: 'en_proceso', mensaje: 'quedó en proceso' },
  emision: { estado: 'lista', mensaje: 'quedó listo: el alumno ya puede descargarlo' },
  rechazo: { estado: 'rechazada', mensaje: 'quedó rechazado; el alumno ve el motivo' },
};

async function verificar(folio: string): Promise<Esquemas['VerificacionRespuesta'] | string> {
  try {
    return await consultar(`/documentos/${encodeURIComponent(folio)}`);
  } catch (error) {
    if (error instanceof ErrorApi && (error.estado === 404 || error.estado === 400)) {
      return `No hay un documento con el folio ${folio}. Revisa cómo está escrito.`;
    }
    throw error;
  }
}

function Acciones({ tramite }: Readonly<{ tramite: Tramite }>) {
  const folio = <input type="hidden" name="folio" value={tramite.folio} />;
  if (tramite.estado === 'recibida') {
    return (
      <Formulario accion={tomarTramite} envio="Tomar">
        {folio}
      </Formulario>
    );
  }
  if (tramite.estado !== 'en_proceso') return '—';
  return (
    <>
      <Formulario accion={emitirTramite} envio="Emitir">
        {folio}
      </Formulario>
      <Formulario accion={rechazarTramite} envio="Rechazar">
        {folio}
        <Campo
          nombre="motivo"
          etiqueta="Motivo del rechazo"
          ayuda="El alumno lo verá."
          correccion="Escribe el motivo, hasta 500 caracteres."
        />
      </Formulario>
    </>
  );
}

/** RF-007 y RF-010, control escolar: la cola de la Fig. 6 y la verificación de un documento por su folio. */
export default async function PaginaTramites({
  searchParams,
}: Readonly<{ searchParams: Promise<{ filtro?: string; hecho?: string; folio?: string; documento?: string }> }>) {
  const { filtro = 'pendientes', hecho, folio, documento = '' } = await searchParams;
  const vigente = FILTROS[filtro] ?? FILTROS.pendientes;
  const todos = await consultar<Tramite[]>('/tramites');
  const cambiado = todos.find((t) => t.folio === folio);
  const resultado = hecho && cambiado && HECHO[hecho]?.estado === cambiado.estado ? HECHO[hecho] : undefined;
  const verificacion = documento.trim() ? await verificar(documento.trim()) : undefined;
  return (
    <>
      <h1>Trámites</h1>
      {resultado && (
        <Aviso tipo="exito">
          El trámite {cambiado?.folio} {resultado.mensaje}.
        </Aviso>
      )}
      <form method="get" className="busqueda">
        <label htmlFor="filtro">Mostrar</label>
        <select id="filtro" name="filtro" defaultValue={filtro}>
          {Object.entries(FILTROS).map(([valor, { etiqueta }]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
        <button type="submit" className="boton">
          Filtrar
        </button>
      </form>
      <Tabla
        titulo={`Trámites: ${vigente.etiqueta.toLowerCase()}`}
        filas={todos.filter((t) => vigente.estados.includes(t.estado))}
        clave={(t) => t.folio}
        columnas={[
          { titulo: 'Folio', celda: (t) => t.folio },
          { titulo: 'Matrícula', celda: (t) => t.matricula },
          { titulo: 'Documento', celda: (t) => ETIQUETA_TIPO_TRAMITE[t.tipo] ?? t.tipo },
          { titulo: 'Estado', celda: estadoDeTramite },
          { titulo: 'Solicitado', celda: (t) => momentoLegible(t.fechaSolicitud) },
          { titulo: 'Acciones', celda: (t) => <Acciones tramite={t} /> },
        ]}
      />

      <h2>Verificar un documento</h2>
      <form method="get" className="busqueda" role="search">
        <label htmlFor="documento">Folio del documento</label>
        <input id="documento" name="documento" type="search" defaultValue={documento} maxLength={40} />
        <button type="submit" className="boton">
          Verificar
        </button>
      </form>
      {typeof verificacion === 'string' && <Aviso tipo="error">{verificacion}</Aviso>}
      {typeof verificacion === 'object' && (
        <>
          <Aviso tipo={verificacion.valido ? 'exito' : 'error'}>
            {verificacion.valido
              ? `El documento ${verificacion.folio} es auténtico: su contenido no ha cambiado desde que se emitió.`
              : `El documento ${verificacion.folio} fue alterado: su contenido no coincide con el que se emitió.`}
          </Aviso>
          <pre className="documento">{verificacion.contenido}</pre>
        </>
      )}
    </>
  );
}
