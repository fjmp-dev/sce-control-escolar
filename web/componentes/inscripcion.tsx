import type { Esquemas } from '@/lib/contrato';
import { estadoDeInscripcion, horarioLegible, momentoLegible, RECHAZO } from '@/lib/formato';
import { Columna, Tabla } from './tabla';

type Inscripcion = Esquemas['InscripcionRespuesta'];
type Grupo = Esquemas['GrupoRespuesta'];

const horarios = (grupo: Grupo) => grupo.horarios.map(horarioLegible).join('; ');

/** RNF-USU-001: el estado se lee en texto y, si es un rechazo, dice qué corregir. */
export function EstadoDeInscripcion({ inscripcion }: Readonly<{ inscripcion: Inscripcion }>) {
  const rechazo = inscripcion.motivoRechazo ? RECHAZO[inscripcion.motivoRechazo] : undefined;
  return (
    <div className="estado-inscripcion">
      <p>
        <strong>Estado:</strong> {estadoDeInscripcion(inscripcion.estado, inscripcion.motivoRechazo)}
      </p>
      {rechazo && (
        <p>
          <strong>Qué hacer:</strong> {rechazo.correccion}
        </p>
      )}
    </div>
  );
}

const COLUMNAS_DE_CARGA: Columna<Grupo>[] = [
  { titulo: 'Materia', celda: (g) => `${g.materiaClave} · ${g.materiaNombre}` },
  { titulo: 'Grupo', celda: (g) => g.clave },
  { titulo: 'Créditos', celda: (g) => g.creditos },
  { titulo: 'Horario', celda: horarios },
];

/** Fig. 4: la confirmación entrega folio y comprobante. */
export function Comprobante({ inscripcion }: Readonly<{ inscripcion: Inscripcion }>) {
  const creditos = inscripcion.grupos.reduce((total, g) => total + g.creditos, 0);
  return (
    <section aria-labelledby="titulo-comprobante">
      <h2 id="titulo-comprobante">Comprobante de inscripción</h2>
      <dl className="datos">
        <dt>Folio</dt>
        <dd>{inscripcion.folio}</dd>
        <dt>Matrícula</dt>
        <dd>{inscripcion.matricula}</dd>
        <dt>Periodo</dt>
        <dd>{inscripcion.periodoClave}</dd>
        <dt>Estado</dt>
        <dd>{estadoDeInscripcion(inscripcion.estado, inscripcion.motivoRechazo)}</dd>
        <dt>Fecha</dt>
        <dd>{momentoLegible(inscripcion.fecha)}</dd>
        <dt>Créditos</dt>
        <dd>{creditos}</dd>
      </dl>
      <Tabla
        titulo="Carga inscrita"
        columnas={COLUMNAS_DE_CARGA}
        filas={inscripcion.grupos}
        clave={(g) => String(g.id)}
      />
    </section>
  );
}

const COLUMNAS: Columna<Inscripcion>[] = [
  { titulo: 'Periodo', celda: (i) => i.periodoClave },
  { titulo: 'Folio', celda: (i) => i.folio },
  { titulo: 'Estado', celda: (i) => estadoDeInscripcion(i.estado, i.motivoRechazo) },
  { titulo: 'Fecha', celda: (i) => momentoLegible(i.fecha) },
  { titulo: 'Carga', celda: (i) => i.grupos.map((g) => `${g.materiaClave} grupo ${g.clave}`).join(', ') },
];

export function ListaDeInscripciones({ inscripciones }: Readonly<{ inscripciones: Inscripcion[] }>) {
  return <Tabla titulo="Inscripciones" columnas={COLUMNAS} filas={inscripciones} clave={(i) => i.folio} />;
}

/** Cada grupo de la oferta como opción legible: materia, grupo, horario y lugares. */
export const opcionesDeOferta = (oferta: Grupo[]) =>
  oferta.map((g) => {
    const lugares = g.cupo - g.ocupacion;
    return {
      valor: String(g.id),
      etiqueta: `${g.materiaClave} ${g.materiaNombre}, grupo ${g.clave}: ${horarios(g)}. ${lugares > 0 ? `${lugares} lugares` : 'Sin lugares'}`,
    };
  });
