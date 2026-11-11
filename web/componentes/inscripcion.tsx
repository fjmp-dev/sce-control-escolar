import { Fragment } from 'react';
import type { Esquemas } from '@/lib/contrato';
import { estadoDeInscripcion, horarioLegible, momentoLegible, RECHAZO } from '@/lib/formato';
import { Insignia, tonoDeEstado } from './insignia';
import { Columna, Tabla } from './tabla';

type Inscripcion = Esquemas['InscripcionRespuesta'];
type Grupo = Esquemas['GrupoRespuesta'];

const horarios = (grupo: Grupo) => grupo.horarios.map(horarioLegible).join('; ');

/** 28.1: el estado va en texto; la insignia solo le da tono. */
const Estado = ({ inscripcion: i }: Readonly<{ inscripcion: Inscripcion }>) => (
  <Insignia tono={tonoDeEstado(i.estado)}>{estadoDeInscripcion(i.estado, i.motivoRechazo)}</Insignia>
);

/** RNF-USU-001: el estado se lee en texto y, si es un rechazo, dice qué corregir. */
export function EstadoDeInscripcion({ inscripcion }: Readonly<{ inscripcion: Inscripcion }>) {
  const rechazo = inscripcion.motivoRechazo ? RECHAZO[inscripcion.motivoRechazo] : undefined;
  return (
    <div className={`estado-inscripcion estado-inscripcion-${tonoDeEstado(inscripcion.estado)}`}>
      <p>
        <strong>Estado:</strong> <Estado inscripcion={inscripcion} />
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
  { titulo: 'Créditos', celda: (g) => g.creditos, numerica: true },
  { titulo: 'Horario', celda: horarios },
];

/** Fig. 4: la confirmación entrega folio y comprobante. */
export function Comprobante({ inscripcion }: Readonly<{ inscripcion: Inscripcion }>) {
  const creditos = inscripcion.grupos.reduce((total, g) => total + g.creditos, 0);
  return (
    <section aria-labelledby="titulo-comprobante" className="tarjeta inscripcion-comprobante">
      <h2 id="titulo-comprobante">Comprobante de inscripción</h2>
      <dl className="datos">
        <dt>Folio</dt>
        <dd>{inscripcion.folio}</dd>
        <dt>Matrícula</dt>
        <dd>{inscripcion.matricula}</dd>
        <dt>Periodo</dt>
        <dd>{inscripcion.periodoClave}</dd>
        <dt>Estado</dt>
        <dd>
          <Estado inscripcion={inscripcion} />
        </dd>
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
  { titulo: 'Folio', celda: (i) => <span className="folio">{i.folio}</span> },
  { titulo: 'Estado', celda: (i) => <Estado inscripcion={i} /> },
  { titulo: 'Fecha', celda: (i) => <span className="sin-corte">{momentoLegible(i.fecha)}</span> },
  {
    titulo: 'Carga',
    celda: (i) =>
      i.grupos.map((g, n) => (
        <Fragment key={g.id}>
          {n > 0 && ', '}
          <span className="sin-corte">
            {g.materiaClave} grupo {g.clave}
          </span>
        </Fragment>
      )),
  },
];

export function ListaDeInscripciones({ inscripciones }: Readonly<{ inscripciones: Inscripcion[] }>) {
  return <Tabla titulo="Inscripciones" columnas={COLUMNAS} filas={inscripciones} clave={(i) => i.folio} />;
}
