import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PERIODO } from '@/lib/formato';
import { Insignia } from './insignia';
import { Tabla } from './tabla';

type Materia = Esquemas['MateriaCursadaRespuesta'];
type Historial = Esquemas['HistorialRespuesta'];

const PARCIALES = [1, 2, 3, 4];
const valor = (m: Materia, parcial: number) => m.parciales.find((p) => p.parcial === parcial)?.valor.toFixed(2) ?? '—';
const clave = (m: Materia) => `${m.periodoClave}-${m.grupoClave}-${m.materiaClave}`;

/** El promedio va destacado; la barra del avance solo refuerza el porcentaje escrito (28.1). */
export function ResumenDelHistorial({ historial }: Readonly<{ historial: Historial }>) {
  return (
    <dl className="cifras">
      <div className="cifra cifra-destacada">
        <dt className="cifra-etiqueta">Promedio</dt>
        <dd className="cifra-valor">{historial.promedio.toFixed(2)}</dd>
      </div>
      <div className="cifra">
        <dt className="cifra-etiqueta">Créditos acumulados</dt>
        <dd className="cifra-valor">{historial.creditosAcumulados}</dd>
      </div>
      <div className="cifra">
        <dt className="cifra-etiqueta">Avance de carrera</dt>
        <dd className="cifra-valor">
          {historial.avance.toFixed(2)} %
          <progress className="academico-avance" max={100} value={historial.avance} aria-hidden="true" />
        </dd>
      </div>
    </dl>
  );
}

/** RF-004: parciales del periodo en curso, al momento de la captura. "—" es un parcial sin capturar. */
export function CalificacionesEnCurso({ materias }: Readonly<{ materias: Materia[] }>) {
  const enCurso = materias.filter((m) => m.estadoPeriodo !== 'cerrado');
  if (enCurso.length === 0) return <p>No tienes materias en un periodo en curso.</p>;
  return (
    <Tabla
      titulo="Calificaciones del periodo en curso"
      filas={enCurso}
      clave={clave}
      columnas={[
        {
          titulo: 'Periodo',
          celda: (m) =>
            `${m.periodoClave}, ${(ETIQUETA_ESTADO_PERIODO[m.estadoPeriodo] ?? m.estadoPeriodo).toLowerCase()}`,
        },
        { titulo: 'Materia', celda: (m) => `${m.materiaClave} ${m.materiaNombre}` },
        { titulo: 'Grupo', celda: (m) => m.grupoClave },
        ...PARCIALES.map((p) => ({ titulo: `Parcial ${p}`, celda: (m: Materia) => valor(m, p), numerica: true })),
      ]}
    />
  );
}

/** RF-005 y Tabla 16: kárdex de periodos cerrados, con la final, si acreditó y si cuenta para el promedio (D-5). */
export function Kardex({ materias }: Readonly<{ materias: Materia[] }>) {
  const cerradas = materias.filter((m) => m.estadoPeriodo === 'cerrado');
  if (cerradas.length === 0) return <p className="vacio">Todavía no hay periodos cerrados.</p>;
  return (
    <Tabla
      titulo="Kárdex"
      filas={cerradas}
      clave={clave}
      columnas={[
        { titulo: 'Periodo', celda: (m) => m.periodoClave },
        { titulo: 'Materia', celda: (m) => `${m.materiaClave} ${m.materiaNombre}` },
        { titulo: 'Créditos', celda: (m) => m.creditos, numerica: true },
        { titulo: 'Final', celda: (m) => <strong>{m.final?.toFixed(2) ?? '—'}</strong>, numerica: true },
        {
          titulo: 'Resultado',
          celda: (m) =>
            m.acreditada ? (
              <Insignia tono="exito">Acreditada</Insignia>
            ) : (
              <Insignia tono="error">No acreditada</Insignia>
            ),
        },
        { titulo: 'Cuenta para el promedio', celda: (m) => (m.vigente ? 'Sí' : 'No, la recursó después') },
      ]}
    />
  );
}
