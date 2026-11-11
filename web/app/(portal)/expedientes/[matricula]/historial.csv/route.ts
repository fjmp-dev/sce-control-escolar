import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { historialCsv, respuestaCsv } from '@/lib/csv';

/** Tabla 16, Portabilidad: control escolar exporta el historial para intercambio institucional. */
export async function GET(_: Request, { params }: { params: Promise<{ matricula: string }> }) {
  const { matricula } = await params;
  try {
    const datos = await consultar<Esquemas['CalificacionesDelAlumnoRespuesta']>(
      `/alumnos/${encodeURIComponent(matricula)}/calificaciones`,
    );
    return respuestaCsv(historialCsv(datos), `historial-${datos.matricula}.csv`);
  } catch (error) {
    // Matrícula inexistente o malformada: 404, no un error 500 (ZAP, 12.2).
    if (error instanceof ErrorApi && (error.estado === 404 || error.estado === 400)) {
      return new Response('No hay un expediente con esa matrícula.', { status: 404 });
    }
    throw error;
  }
}
