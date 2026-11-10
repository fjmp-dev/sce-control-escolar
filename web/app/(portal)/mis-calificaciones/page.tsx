import { Aviso } from '@/componentes/aviso';
import { CalificacionesEnCurso, Kardex, ResumenDelHistorial } from '@/componentes/calificaciones';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';

export const metadata = { title: 'Mis calificaciones' };

/** RF-004 y RF-005: el alumno consulta sus parciales al momento de la captura, su kárdex y su avance. */
export default async function PaginaMisCalificaciones() {
  let datos: Esquemas['CalificacionesDelAlumnoRespuesta'];
  try {
    datos = await consultar('/alumnos/actual/calificaciones');
  } catch (error) {
    if (!(error instanceof ErrorApi) || error.codigo !== 'SIN_EXPEDIENTE') throw error;
    return (
      <>
        <h1>Mis calificaciones</h1>
        <Aviso tipo="informacion">{error.message}</Aviso>
      </>
    );
  }
  return (
    <>
      <h1>Mis calificaciones</h1>
      <h2>Historial</h2>
      <p>Se recalcula cada vez que cierra un periodo.</p>
      <ResumenDelHistorial historial={datos.historial} />
      <h2>Periodo en curso</h2>
      <CalificacionesEnCurso materias={datos.materias} />
      <h2>Kárdex</h2>
      <Kardex materias={datos.materias} />
      <p>
        <a href="/mis-calificaciones/historial.csv" download>
          Descargar mi historial (CSV)
        </a>
      </p>
    </>
  );
}
