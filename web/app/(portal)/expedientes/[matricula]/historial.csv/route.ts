import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { historialCsv, respuestaCsv } from '@/lib/csv';

/** Tabla 16, Portabilidad: control escolar exporta el historial para intercambio institucional. */
export async function GET(_: Request, { params }: { params: Promise<{ matricula: string }> }) {
  const { matricula } = await params;
  const datos = await consultar<Esquemas['CalificacionesDelAlumnoRespuesta']>(
    `/alumnos/${encodeURIComponent(matricula)}/calificaciones`,
  );
  return respuestaCsv(historialCsv(datos), `historial-${datos.matricula}.csv`);
}
