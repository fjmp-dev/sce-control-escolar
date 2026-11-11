import { Aviso } from '@/componentes/aviso';
import { DatosDelExpediente } from '@/componentes/expediente';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';

export const metadata = { title: 'Mi expediente' };

/** RF-001 y Tabla 16 (Accesibilidad): el alumno consulta su propio expediente; la matrícula sale de su sesión. */
export default async function PaginaMiExpediente() {
  let expediente: Esquemas['ExpedienteRespuesta'];
  try {
    expediente = await consultar<Esquemas['ExpedienteRespuesta']>('/alumnos/actual');
  } catch (error) {
    if (error instanceof ErrorApi && error.codigo === 'SIN_EXPEDIENTE') {
      return (
        <>
          <h1>Mi expediente</h1>
          <Aviso tipo="informacion">{error.message}</Aviso>
        </>
      );
    }
    throw error;
  }
  return (
    <>
      <h1>Mi expediente</h1>
      <DatosDelExpediente expediente={expediente} />
    </>
  );
}
