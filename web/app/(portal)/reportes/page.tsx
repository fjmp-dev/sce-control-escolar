import { Aviso } from '@/componentes/aviso';
import { Tabla } from '@/componentes/tabla';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PERIODO, momentoLegible, pesos } from '@/lib/formato';

export const metadata = { title: 'Reportes' };

type Fila = Esquemas['IndicadoresRespuesta'];

const porciento = (valor: number) => `${valor.toFixed(2)} %`;
const facultad = { titulo: 'Facultad', celda: (f: Fila) => f.facultadNombre };

async function reporteDe(clave: string): Promise<Esquemas['ReporteRespuesta'] | string> {
  try {
    return await consultar(`/periodos/${encodeURIComponent(clave)}/reporte`);
  } catch (error) {
    if (error instanceof ErrorApi && (error.estado === 404 || error.estado === 400)) {
      return `No hay un periodo ${clave}. Elige uno de la lista.`;
    }
    throw error;
  }
}

/** RF-009, dirección: inscripción, avance y cobranza por facultad y de toda la universidad, sin datos de alumnos. */
export default async function PaginaReportes({ searchParams }: Readonly<{ searchParams: Promise<{ periodo?: string }> }>) {
  const periodos = (await consultar<Esquemas['PeriodoRespuesta'][]>('/periodos')).toSorted((a, b) =>
    b.clave.localeCompare(a.clave),
  );
  const clave = (await searchParams).periodo ?? periodos[0]?.clave;
  const reporte = clave ? await reporteDe(clave) : 'Todavía no hay periodos.';
  return (
    <>
      <h1>Reportes</h1>
      <form method="get" className="busqueda">
        <label htmlFor="periodo">Periodo</label>
        <select id="periodo" name="periodo" defaultValue={clave}>
          {periodos.map((p) => (
            <option key={p.clave} value={p.clave}>
              {p.clave} ({ETIQUETA_ESTADO_PERIODO[p.estado] ?? p.estado})
            </option>
          ))}
        </select>
        <button type="submit" className="boton">
          Consultar
        </button>
      </form>
      {typeof reporte === 'string' && <Aviso tipo="error">{reporte}</Aviso>}
      {typeof reporte === 'object' && (
        <>
          <p>
            Periodo {reporte.periodoClave}, generado el {momentoLegible(reporte.generadoEn)}. La última fila suma toda
            la universidad.
          </p>
          <h2>Inscripción</h2>
          <Tabla
            titulo={`Inscripción en ${reporte.periodoClave}`}
            filas={reporte.filas}
            clave={(f) => f.facultadClave ?? 'universidad'}
            columnas={[
              facultad,
              { titulo: 'Alumnos activos', celda: (f) => f.alumnosActivos },
              { titulo: 'Inscritos', celda: (f) => f.inscritos },
              { titulo: 'Inscritos de los activos', celda: (f) => porciento(f.inscripcionPorcentaje) },
            ]}
          />
          <h2>Avance académico</h2>
          <Tabla
            titulo="Avance académico"
            filas={reporte.filas}
            clave={(f) => f.facultadClave ?? 'universidad'}
            columnas={[
              facultad,
              { titulo: 'Promedio general', celda: (f) => f.promedioGeneral.toFixed(2) },
              { titulo: 'Avance de carrera promedio', celda: (f) => porciento(f.avancePromedio) },
            ]}
          />
          <h2>Cobranza</h2>
          <Tabla
            titulo="Cobranza"
            filas={reporte.filas}
            clave={(f) => f.facultadClave ?? 'universidad'}
            columnas={[
              facultad,
              { titulo: 'Cargos', celda: (f) => pesos(f.cargos) },
              { titulo: 'Pagado', celda: (f) => pesos(f.pagado) },
              { titulo: 'Becas', celda: (f) => pesos(f.becas) },
              { titulo: 'Saldo pendiente', celda: (f) => pesos(f.saldoPendiente) },
              { titulo: 'Alumnos con adeudo', celda: (f) => f.alumnosConAdeudo },
              { titulo: 'Cobrado', celda: (f) => porciento(f.cobranzaPorcentaje) },
            ]}
          />
        </>
      )}
    </>
  );
}
