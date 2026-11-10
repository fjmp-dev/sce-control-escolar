import { Sesiones } from '@/componentes/horario';
import { Tabla } from '@/componentes/tabla';
import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';

export const metadata = { title: 'Mis grupos' };

type Grupo = Esquemas['GrupoAsignadoRespuesta'];

/** Tabla 5 y 3.4: el profesor consulta sus grupos y su horario de los periodos que no han cerrado. */
export default async function PaginaMisGrupos() {
  const grupos = await consultar<Grupo[]>('/profesores/actual/grupos');
  const periodos = [...new Set(grupos.map((g) => g.periodoClave))].sort();
  return (
    <>
      <h1>Mis grupos</h1>
      {periodos.length === 0 && <p>No tienes grupos asignados en un periodo abierto o en curso.</p>}
      {periodos.map((periodo) => {
        const delPeriodo = grupos.filter((g) => g.periodoClave === periodo);
        return (
          <section key={periodo} aria-labelledby={`periodo-${periodo}`}>
            <h2 id={`periodo-${periodo}`}>Periodo {periodo}</h2>
            <Tabla
              titulo={`Grupos de ${periodo}`}
              filas={delPeriodo}
              clave={(g) => String(g.id)}
              columnas={[
                { titulo: 'Materia', celda: (g) => `${g.materiaClave} ${g.materiaNombre}` },
                { titulo: 'Grupo', celda: (g) => g.clave },
                { titulo: 'Inscritos', celda: (g) => `${g.ocupacion} de ${g.cupo}` },
              ]}
            />
            <h3>Horario</h3>
            <Sesiones titulo={`Horario de ${periodo}`} grupos={delPeriodo} />
          </section>
        );
      })}
    </>
  );
}
