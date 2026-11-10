import { DIAS_DE_LA_SEMANA } from '@/lib/formato';
import { Tabla } from './tabla';

interface GrupoConHorario {
  clave: string;
  materiaClave: string;
  materiaNombre: string;
  horarios: { dia: number; horaInicio: string; horaFin: string; aula: string }[];
}

/** 3.4, impartición: las sesiones de la semana en orden de día y hora, como cada rol consulta su horario. */
export function Sesiones({ titulo, grupos }: Readonly<{ titulo: string; grupos: GrupoConHorario[] }>) {
  const sesiones = grupos
    .flatMap((g) => g.horarios.map((h) => ({ ...h, grupo: g })))
    .sort((a, b) => a.dia - b.dia || a.horaInicio.localeCompare(b.horaInicio));
  return (
    <Tabla
      titulo={titulo}
      filas={sesiones}
      clave={(s) => `${s.grupo.clave}-${s.dia}-${s.horaInicio}`}
      columnas={[
        { titulo: 'Día', celda: (s) => DIAS_DE_LA_SEMANA[s.dia - 1] },
        { titulo: 'Hora', celda: (s) => `${s.horaInicio} a ${s.horaFin}` },
        { titulo: 'Materia', celda: (s) => `${s.grupo.materiaClave} ${s.grupo.materiaNombre}` },
        { titulo: 'Grupo', celda: (s) => s.grupo.clave },
        { titulo: 'Aula', celda: (s) => s.aula },
      ]}
    />
  );
}
