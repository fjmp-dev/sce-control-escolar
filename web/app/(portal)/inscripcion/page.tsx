import { Aviso } from '@/componentes/aviso';
import { Casillas, Formulario } from '@/componentes/formulario';
import { BotonImprimir } from '@/componentes/imprimir';
import { Comprobante, EstadoDeInscripcion, ListaDeInscripciones, opcionesDeOferta } from '@/componentes/inscripcion';
import { enviarCarga } from '@/lib/acciones';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';

export const metadata = { title: 'Inscripción' };

type Inscripcion = Esquemas['InscripcionRespuesta'];

async function misInscripciones(): Promise<Inscripcion[] | ErrorApi> {
  try {
    return await consultar<Inscripcion[]>('/alumnos/actual/inscripciones');
  } catch (error) {
    if (error instanceof ErrorApi && error.codigo === 'SIN_EXPEDIENTE') return error;
    throw error;
  }
}

/** RF-002 y RNF-USU-001: armar la carga, revisar choques, enviarla, ver el estado con su corrección y el comprobante. */
export default async function PaginaInscripcion() {
  const inscripciones = await misInscripciones();
  if (inscripciones instanceof ErrorApi) {
    return (
      <>
        <h1>Inscripción</h1>
        <Aviso tipo="informacion">{inscripciones.message}</Aviso>
      </>
    );
  }
  const periodos = await consultar<Esquemas['PeriodoRespuesta'][]>('/periodos');
  // Si hay más de un periodo abierto, se inscribe en el que empieza antes.
  const abierto = periodos
    .filter((p) => p.estado === 'abierto')
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))[0];
  const actual = abierto && inscripciones.find((i) => i.periodoClave === abierto.clave);
  const anteriores = inscripciones.filter((i) => i !== actual);
  const oferta = abierto
    ? await consultar<Esquemas['GrupoRespuesta'][]>(`/grupos?periodo=${encodeURIComponent(abierto.clave)}`)
    : [];
  const confirmada = actual?.estado === 'confirmada';

  return (
    <>
      <h1>Inscripción{abierto && ` ${abierto.clave}`}</h1>
      {!abierto && <Aviso tipo="informacion">No hay un periodo de inscripción abierto.</Aviso>}
      {actual && <EstadoDeInscripcion inscripcion={actual} />}
      {actual && confirmada && (
        <>
          <Comprobante inscripcion={actual} />
          <BotonImprimir />
        </>
      )}
      {abierto && (
        <>
          <h2>{confirmada ? 'Ajustar tu carga' : 'Arma tu carga'}</h2>
          <p>
            {confirmada
              ? 'Mientras el periodo esté abierto puedes dar de alta o de baja grupos. La carga nueva se valida otra vez; si no pasa, conservas la que tienes.'
              : 'Elige un grupo por materia y revisa si hay choques de horario. Al enviarla se validan, en este orden, los prerrequisitos, los adeudos y los choques.'}
          </p>
          <Formulario
            accion={enviarCarga}
            envio={confirmada ? 'Ajustar carga' : 'Enviar carga'}
            alterno={{ valor: 'revisar', etiqueta: 'Revisar choques' }}
          >
            {confirmada ? (
              <input type="hidden" name="folio" value={actual.folio} />
            ) : (
              <input type="hidden" name="periodoClave" value={abierto.clave} />
            )}
            <Casillas
              nombre="grupos"
              etiqueta={`Oferta de ${abierto.clave}`}
              correccion="Elige al menos un grupo, solo uno por materia."
              opciones={opcionesDeOferta(oferta)}
              marcadas={actual?.grupos.map((g) => String(g.id)) ?? []}
            />
          </Formulario>
        </>
      )}
      {anteriores.length > 0 && (
        <>
          <h2>Inscripciones anteriores</h2>
          <ListaDeInscripciones inscripciones={anteriores} />
        </>
      )}
    </>
  );
}
