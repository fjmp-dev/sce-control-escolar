import { Aviso } from '@/componentes/aviso';
import { Campo, Formulario, Selector } from '@/componentes/formulario';
import { Sesiones } from '@/componentes/horario';
import { Tabla } from '@/componentes/tabla';
import { definirGrupo, publicarOferta } from '@/lib/acciones';
import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { SESIONES_DEL_FORMULARIO } from '@/lib/estado';
import { DIAS_DE_LA_SEMANA, ETIQUETA_ESTADO_PERIODO, horarioLegible, momentoLegible } from '@/lib/formato';
import { AYUDA_CLAVE, CORRECCION_CLAVE } from '@/lib/textos';

export const metadata = { title: 'Oferta' };

type Periodo = Esquemas['PeriodoRespuesta'];
type Grupo = Esquemas['GrupoDeOfertaRespuesta'];

const DIAS = DIAS_DE_LA_SEMANA.map((etiqueta, i) => ({ valor: String(i + 1), etiqueta }));

/** Por omisión, el periodo abierto que empieza antes; si no hay ninguno abierto, el más reciente. */
const periodoPorOmision = (periodos: Periodo[]) =>
  periodos.filter((p) => p.estado === 'abierto').sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))[0] ??
  periodos[0];

/** RF-003 y Fig. 7: coordinación define los grupos del periodo, con profesor, aula y horario, y publica la oferta. */
export default async function PaginaOferta({
  searchParams,
}: Readonly<{ searchParams: Promise<{ periodo?: string }> }>) {
  const { periodo: elegido } = await searchParams;
  const [periodos, materias] = await Promise.all([
    consultar<Periodo[]>('/periodos'),
    consultar<Esquemas['MateriaRespuesta'][]>('/materias'),
  ]);
  const periodo = periodos.find((p) => p.clave === elegido) ?? periodoPorOmision(periodos);
  if (!periodo) {
    return (
      <>
        <h1>Oferta</h1>
        <Aviso tipo="informacion">No hay periodos. Abre uno en la página Periodos.</Aviso>
      </>
    );
  }
  const grupos = await consultar<Grupo[]>(`/periodos/${encodeURIComponent(periodo.clave)}/grupos`);
  const abierto = periodo.estado === 'abierto';

  return (
    <>
      <h1>Oferta {periodo.clave}</h1>
      <form method="get" className="busqueda">
        <label htmlFor="periodo">Periodo</label>
        <select id="periodo" name="periodo" defaultValue={periodo.clave}>
          {periodos.map((p) => (
            <option key={p.clave} value={p.clave}>
              {p.clave}, {ETIQUETA_ESTADO_PERIODO[p.estado] ?? p.estado}
            </option>
          ))}
        </select>
        <button type="submit" className="boton boton-secundario">
          Ver oferta
        </button>
      </form>

      {periodo.ofertaPublicadaEn ? (
        <Aviso tipo="exito">
          Oferta publicada el {momentoLegible(periodo.ofertaPublicadaEn)}. Los alumnos la ven y los grupos que agregues
          aparecen al momento.
        </Aviso>
      ) : (
        <Aviso tipo="informacion">
          {abierto
            ? 'La oferta todavía no se publica: los alumnos no la ven ni pueden inscribirse.'
            : `El periodo está ${(ETIQUETA_ESTADO_PERIODO[periodo.estado] ?? periodo.estado).toLowerCase()} y su oferta no se publicó.`}
        </Aviso>
      )}
      {abierto && !periodo.ofertaPublicadaEn && (
        <Formulario accion={publicarOferta} envio={`Publicar la oferta de ${periodo.clave}`}>
          <input type="hidden" name="periodoClave" value={periodo.clave} />
          <p>Revisa los grupos antes de publicar. Una vez publicada, la oferta no se retira.</p>
        </Formulario>
      )}

      <h2>Grupos del periodo</h2>
      <Tabla
        titulo={`Grupos de ${periodo.clave}`}
        filas={grupos}
        clave={(g) => String(g.id)}
        columnas={[
          { titulo: 'Materia', celda: (g) => `${g.materiaClave} ${g.materiaNombre}` },
          { titulo: 'Grupo', celda: (g) => g.clave },
          { titulo: 'Profesor', celda: (g) => g.profesor },
          { titulo: 'Inscritos', celda: (g) => `${g.ocupacion} de ${g.cupo}` },
          { titulo: 'Horario', celda: (g) => g.horarios.map(horarioLegible).join('; ') },
        ]}
      />
      {grupos.length > 0 && (
        <>
          <h2>Sesiones de la semana</h2>
          <Sesiones titulo={`Sesiones de ${periodo.clave}`} grupos={grupos} />
        </>
      )}

      {abierto && (
        <>
          <h2>Definir un grupo</h2>
          <p>
            El aula y el profesor no pueden tener dos grupos a la misma hora en el periodo. Si una clase termina a las 9
            y otra empieza a las 9, no chocan.
          </p>
          <Formulario accion={definirGrupo} envio="Definir grupo">
            <input type="hidden" name="periodoClave" value={periodo.clave} />
            <Selector
              nombre="materiaClave"
              etiqueta="Materia"
              correccion="Elige la materia del grupo."
              opciones={materias.map((m) => ({ valor: m.clave, etiqueta: `${m.clave} ${m.nombre}` }))}
            />
            <Campo nombre="clave" etiqueta="Clave del grupo" ayuda={AYUDA_CLAVE} correccion={CORRECCION_CLAVE} />
            <Campo
              nombre="profesor"
              etiqueta="Correo del profesor"
              tipo="email"
              ayuda="El de su cuenta en el sistema, con el rol de profesor."
              correccion="Escribe un correo válido, como profesor@sce.test."
            />
            <Campo
              nombre="cupo"
              etiqueta="Cupo"
              tipo="number"
              ayuda="Lugares del grupo, al menos 1."
              correccion="Escribe un número entero mayor que cero."
            />
            {Array.from({ length: SESIONES_DEL_FORMULARIO }, (_, i) => i + 1).map((s) => (
              <fieldset key={s} className="campo">
                <legend>{s === 1 ? 'Sesión 1' : `Sesión ${s} (opcional)`}</legend>
                <Selector
                  nombre={`dia${s}`}
                  etiqueta="Día"
                  correccion="Elige el día de la sesión."
                  opciones={DIAS}
                  opcional={s > 1}
                />
                <Campo
                  nombre={`inicio${s}`}
                  etiqueta="Hora de inicio"
                  tipo="time"
                  correccion="Escribe la hora en formato de 24 horas, como 07:00."
                  opcional={s > 1}
                />
                <Campo
                  nombre={`fin${s}`}
                  etiqueta="Hora de fin"
                  tipo="time"
                  ayuda="Posterior a la hora de inicio."
                  correccion="Escribe una hora posterior a la de inicio, como 09:00."
                  opcional={s > 1}
                />
                <Campo
                  nombre={`aula${s}`}
                  etiqueta="Aula"
                  ayuda="Hasta 20 caracteres. Ejemplo: A1."
                  correccion="Escribe el aula, hasta 20 caracteres."
                  opcional={s > 1}
                />
              </fieldset>
            ))}
          </Formulario>
        </>
      )}
    </>
  );
}
