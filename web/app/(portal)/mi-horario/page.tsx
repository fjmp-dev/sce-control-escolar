import { Aviso } from '@/componentes/aviso';
import { Sesiones } from '@/componentes/horario';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';

export const metadata = { title: 'Mi horario' };

type Inscripcion = Esquemas['InscripcionRespuesta'];

/** Fig. 6: la carga vigente es la confirmada o ajustada; la de un periodo cerrado ya es historial. */
const VIGENTES = new Set(['confirmada', 'ajustada']);

/** 3.4, impartición: el alumno consulta el horario de su carga confirmada. */
export default async function PaginaMiHorario() {
  let inscripciones: Inscripcion[];
  try {
    inscripciones = await consultar<Inscripcion[]>('/alumnos/actual/inscripciones');
  } catch (error) {
    if (!(error instanceof ErrorApi) || error.codigo !== 'SIN_EXPEDIENTE') throw error;
    return (
      <>
        <h1>Mi horario</h1>
        <Aviso tipo="informacion">{error.message}</Aviso>
      </>
    );
  }
  const vigentes = inscripciones.filter((i) => VIGENTES.has(i.estado));
  return (
    <>
      <h1>Mi horario</h1>
      {vigentes.length === 0 && <p>No tienes una carga confirmada. Inscríbete en la página Inscripción.</p>}
      {vigentes.map((i) => (
        <section key={i.folio} aria-labelledby={`horario-${i.folio}`}>
          <h2 id={`horario-${i.folio}`}>Periodo {i.periodoClave}</h2>
          <Sesiones titulo={`Mi horario de ${i.periodoClave}`} grupos={i.grupos} />
        </section>
      ))}
    </>
  );
}
