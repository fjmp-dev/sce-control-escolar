import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Aviso } from '@/componentes/aviso';
import { Formulario } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { capturarParcial } from '@/lib/acciones';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PERIODO } from '@/lib/formato';
import { CampoDeCalificacion } from './campo';

export const metadata = { title: 'Calificaciones del grupo' };

type Grupo = Esquemas['CalificacionesDelGrupoRespuesta'];
const PARCIALES = [1, 2, 3, 4]; // D-10, provisional

async function grupoO404(id: string) {
  try {
    return await consultar<Grupo>(`/grupos/${encodeURIComponent(id)}/calificaciones`);
  } catch (error) {
    if (error instanceof ErrorApi && (error.estado === 404 || error.estado === 400)) notFound();
    throw error;
  }
}

/**
 * RF-004: el profesor captura un parcial de los alumnos de su grupo. El parcial se elige primero; por omisión, el
 * último que tiene calificaciones, para completarlo. Lo capturado lo ve el alumno al momento (CI-CAL-01).
 */
export default async function PaginaCalificacionesDelGrupo({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ id: string }>; searchParams: Promise<{ parcial?: string }> }>) {
  const [{ id }, { parcial: pedido }] = await Promise.all([params, searchParams]);
  const grupo = await grupoO404(id);
  const parcial = PARCIALES.includes(Number(pedido)) ? Number(pedido) : (grupo.parciales.at(-1) ?? 1);
  const enCurso = grupo.estadoPeriodo === 'en_curso';
  const valorDe = (a: Grupo['alumnos'][number], p: number) => a.calificaciones.find((c) => c.parcial === p)?.valor;

  return (
    <>
      <p>
        <Link href="/mis-grupos" prefetch={false}>
          Volver a mis grupos
        </Link>
      </p>
      <h1>
        {grupo.materiaClave} {grupo.materiaNombre}, grupo {grupo.clave}
      </h1>
      <p>
        Periodo {grupo.periodoClave},{' '}
        {(ETIQUETA_ESTADO_PERIODO[grupo.estadoPeriodo] ?? grupo.estadoPeriodo).toLowerCase()}.
      </p>
      {!enCurso && (
        <Aviso tipo="informacion">
          {grupo.estadoPeriodo === 'cerrado'
            ? 'El periodo ya cerró. Si hay que corregir una calificación, pídelo a coordinación con el motivo y la evidencia.'
            : 'La captura empieza cuando coordinación inicia el curso del periodo.'}
        </Aviso>
      )}

      <h2>Calificaciones capturadas</h2>
      <Tabla
        titulo={`Calificaciones del grupo ${grupo.clave}`}
        filas={grupo.alumnos}
        clave={(a) => a.folio}
        columnas={[
          { titulo: 'Matrícula', celda: (a) => a.matricula },
          { titulo: 'Nombre', celda: (a) => a.nombre },
          ...PARCIALES.map((p) => ({
            titulo: `Parcial ${p}`,
            celda: (a: Grupo['alumnos'][number]) => valorDe(a, p)?.toFixed(2) ?? '—',
          })),
        ]}
      />

      {enCurso && grupo.alumnos.length > 0 && (
        <>
          <h2>Capturar el parcial {parcial}</h2>
          <form method="get" className="busqueda">
            <label htmlFor="parcial">Parcial a capturar</label>
            <select id="parcial" name="parcial" defaultValue={String(parcial)}>
              {PARCIALES.map((p) => (
                <option key={p} value={p}>
                  Parcial {p}
                </option>
              ))}
            </select>
            <button type="submit" className="boton boton-secundario">
              Cambiar de parcial
            </button>
          </form>
          <p>
            De 0 a 10, con dos decimales a lo más. Deja en blanco a quien todavía no calificas. Cada cambio queda
            registrado con el valor anterior.
          </p>
          {/* La clave remonta el formulario al cambiar de parcial: defaultValue solo se aplica al montar. */}
          <Formulario key={parcial} accion={capturarParcial} envio={`Guardar el parcial ${parcial}`}>
            <input type="hidden" name="grupo" value={grupo.id} />
            <input type="hidden" name="parcial" value={parcial} />
            {grupo.alumnos.map((a) => (
              <CampoDeCalificacion
                key={a.folio}
                nombre={`valor:${a.folio}`}
                etiqueta={`${a.nombre} (${a.matricula})`}
                valor={valorDe(a, parcial)}
              />
            ))}
          </Formulario>
        </>
      )}
    </>
  );
}
