import { Aviso } from '@/componentes/aviso';
import { Campo, Formulario } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { abrirPeriodo, cerrarPeriodo, iniciarCurso } from '@/lib/acciones';
import { consultar, sesionActual } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PERIODO, fechaLegible, momentoLegible } from '@/lib/formato';
import { puedeDarDeAlta } from '@/lib/roles';
import { CORRECCION_FECHA } from '@/lib/textos';

export const metadata = { title: 'Periodos' };

/** El resultado de iniciar o cerrar, confirmado contra el estado real del periodo: nunca texto de la dirección. */
const HECHO = {
  inicio: {
    estado: 'en_curso',
    mensaje: (c: string) => `Curso de ${c} iniciado. La inscripción terminó y los profesores ya pueden capturar.`,
  },
  cierre: {
    estado: 'cerrado',
    mensaje: (c: string) => `Periodo ${c} cerrado. Promedio, créditos y avance de sus alumnos quedaron recalculados.`,
  },
} as const;

export default async function PaginaPeriodos({
  searchParams,
}: Readonly<{ searchParams?: Promise<{ hecho?: string; periodo?: string }> }> = {}) {
  const { hecho, periodo: clave } = (await searchParams) ?? {};
  const [{ roles }, periodos] = await Promise.all([
    sesionActual(),
    consultar<Esquemas['PeriodoRespuesta'][]>('/periodos'),
  ]);
  return (
    <>
      <h1>Periodos</h1>
      {puedeDarDeAlta('periodos', roles) && (
        <>
          <h2>Abrir un periodo</h2>
          <p>
            El periodo se abre sin oferta. Después define sus grupos y publica la oferta en la página Oferta; hasta
            entonces los alumnos no la ven.
          </p>
          <Formulario accion={abrirPeriodo} envio="Abrir periodo">
            <Campo
              nombre="clave"
              etiqueta="Clave"
              ayuda="Año de cuatro dígitos y la letra A o B. Ejemplo: 2027A."
              correccion="Usa el año y la letra A o B, como 2027A."
            />
            <Campo nombre="fechaInicio" etiqueta="Fecha de inicio" tipo="date" correccion={CORRECCION_FECHA} />
            <Campo
              nombre="fechaFin"
              etiqueta="Fecha de fin"
              tipo="date"
              ayuda="Debe ser posterior a la fecha de inicio."
              correccion={CORRECCION_FECHA}
            />
          </Formulario>
        </>
      )}
      {puedeDarDeAlta('periodos', roles) && (
        <CicloDelPeriodo periodos={periodos} resultado={resultadoDe(periodos, hecho, clave)} />
      )}
      <h2>Periodos registrados</h2>
      <Tabla
        titulo="Periodos registrados"
        filas={periodos}
        clave={(p) => p.clave}
        columnas={[
          { titulo: 'Clave', celda: (p) => p.clave },
          { titulo: 'Inicio', celda: (p) => fechaLegible(p.fechaInicio) },
          { titulo: 'Fin', celda: (p) => fechaLegible(p.fechaFin) },
          { titulo: 'Estado', celda: (p) => ETIQUETA_ESTADO_PERIODO[p.estado] ?? p.estado },
          {
            titulo: 'Oferta',
            celda: (p) =>
              p.ofertaPublicadaEn ? `Publicada el ${momentoLegible(p.ofertaPublicadaEn)}` : 'Sin publicar',
          },
        ]}
      />
    </>
  );
}

/**
 * Fig. 7: coordinación inicia el curso de un periodo abierto con la oferta publicada (CC-019) y cierra el que está en
 * curso (RF-005). El cierre solo procede con todos los parciales capturados (D-16).
 */
function resultadoDe(periodos: Esquemas['PeriodoRespuesta'][], hecho?: string, clave?: string) {
  if (hecho !== 'inicio' && hecho !== 'cierre') return undefined;
  const periodo = periodos.find((p) => p.clave === clave);
  return periodo?.estado === HECHO[hecho].estado ? HECHO[hecho].mensaje(periodo.clave) : undefined;
}

function CicloDelPeriodo({
  periodos,
  resultado,
}: Readonly<{ periodos: Esquemas['PeriodoRespuesta'][]; resultado?: string }>) {
  const porIniciar = periodos.filter((p) => p.estado === 'abierto' && p.ofertaPublicadaEn);
  const enCurso = periodos.filter((p) => p.estado === 'en_curso');
  if (porIniciar.length === 0 && enCurso.length === 0 && !resultado) return null;
  return (
    <>
      <h2>Iniciar el curso o cerrar el periodo</h2>
      {resultado && <Aviso tipo="exito">{resultado}</Aviso>}
      {porIniciar.map((p) => (
        <Formulario key={p.clave} accion={iniciarCurso} envio={`Iniciar el curso de ${p.clave}`}>
          <input type="hidden" name="periodoClave" value={p.clave} />
          <p>Termina la inscripción y el ajuste de cargas de {p.clave}, y empieza la captura de calificaciones.</p>
        </Formulario>
      ))}
      {enCurso.map((p) => (
        <Formulario key={p.clave} accion={cerrarPeriodo} envio={`Cerrar el periodo ${p.clave}`}>
          <input type="hidden" name="periodoClave" value={p.clave} />
          <p>
            Termina la captura de {p.clave} y recalcula promedio, créditos y avance de sus alumnos. Solo procede si cada
            alumno tiene todos sus parciales. Después, una corrección la autoriza coordinación con motivo y evidencia.
          </p>
        </Formulario>
      ))}
    </>
  );
}
