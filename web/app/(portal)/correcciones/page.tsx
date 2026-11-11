import { Aviso } from '@/componentes/aviso';
import { Kardex } from '@/componentes/calificaciones';
import { Campo, Formulario, Selector } from '@/componentes/formulario';
import { corregirCalificacion } from '@/lib/acciones';
import { redirect } from 'next/navigation';
import { consultar, ErrorApi, sesionActual } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';

export const metadata = { title: 'Correcciones' };

type Calificaciones = Esquemas['CalificacionesDelAlumnoRespuesta'];

async function delAlumno(matricula: string): Promise<Calificaciones | string> {
  try {
    return await consultar<Calificaciones>(`/alumnos/${encodeURIComponent(matricula)}/calificaciones`);
  } catch (error) {
    if (error instanceof ErrorApi && (error.estado === 404 || error.estado === 400)) {
      return `No hay un expediente con la matrícula ${matricula}. Revisa los dígitos.`;
    }
    throw error;
  }
}

/**
 * D-17 (6.2-6; PA-SCE-001, Parte B): después del cierre, coordinación autoriza la corrección de una calificación con
 * motivo y evidencia. Queda en bitácora y el historial del alumno se recalcula.
 */
export default async function PaginaCorrecciones({
  searchParams,
}: Readonly<{ searchParams: Promise<{ matricula?: string }> }>) {
  // Sin matrícula no se consulta la API: la página confirma el rol para no mostrar el formulario a quien no lo usa.
  if (!(await sesionActual()).roles.includes('coordinacion')) redirect('/sin-permiso');
  const matricula = ((await searchParams).matricula ?? '').trim();
  const datos = matricula ? await delAlumno(matricula) : undefined;
  const cerradas = typeof datos === 'object' ? datos.materias.filter((m) => m.estadoPeriodo === 'cerrado') : [];
  return (
    <>
      <h1>Correcciones de calificaciones</h1>
      <p className="entrada">
        Mientras el periodo está en curso, el profesor del grupo corrige en su captura. Después del cierre, la
        corrección la autoriza coordinación, con el motivo y el documento que la respalda.
      </p>
      <form method="get" className="busqueda" role="search">
        <label htmlFor="matricula">Matrícula del alumno</label>
        <input
          id="matricula"
          name="matricula"
          type="search"
          inputMode="numeric"
          defaultValue={matricula}
          maxLength={10}
        />
        <button type="submit" className="boton">
          Buscar
        </button>
      </form>
      {typeof datos === 'string' && <Aviso tipo="error">{datos}</Aviso>}
      {typeof datos === 'object' && (
        <>
          <h2>Kárdex de {datos.matricula}</h2>
          <Kardex materias={datos.materias} />
          {cerradas.length > 0 && (
            <>
              <h2>Corregir una calificación</h2>
              <Formulario accion={corregirCalificacion} envio="Autorizar la corrección">
                <input type="hidden" name="matricula" value={datos.matricula} />
                <Selector
                  nombre="calificacion"
                  etiqueta="Calificación a corregir"
                  correccion="Elige la calificación."
                  opciones={cerradas.flatMap((m) =>
                    m.parciales.map((p) => ({
                      valor: String(p.id),
                      etiqueta: `${m.periodoClave}, ${m.materiaClave} ${m.materiaNombre}, parcial ${p.parcial}: ${p.valor.toFixed(2)}`,
                    })),
                  )}
                />
                <Campo
                  nombre="valor"
                  etiqueta="Calificación correcta"
                  tipo="number"
                  ayuda="De 0 a 10, con dos decimales a lo más."
                  correccion="Escribe un número de 0 a 10, distinto del actual."
                />
                <Campo
                  nombre="motivo"
                  etiqueta="Motivo"
                  ayuda="Por qué se corrige. Queda en la bitácora."
                  correccion="Escribe el motivo, hasta 500 caracteres."
                />
                <Campo
                  nombre="evidencia"
                  etiqueta="Evidencia"
                  ayuda="El documento que la respalda, por ejemplo el número de oficio del profesor."
                  correccion="Escribe la evidencia, hasta 200 caracteres."
                />
              </Formulario>
            </>
          )}
        </>
      )}
    </>
  );
}
