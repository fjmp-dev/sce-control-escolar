import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { historialCsv, respuestaCsv } from '@/lib/csv';

/** Tabla 16, Portabilidad: el alumno descarga su historial en formato tabular. */
export async function GET() {
  const datos = await consultar<Esquemas['CalificacionesDelAlumnoRespuesta']>('/alumnos/actual/calificaciones');
  return respuestaCsv(historialCsv(datos), `historial-${datos.matricula}.csv`);
}
