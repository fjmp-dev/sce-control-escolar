import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DatosDelExpediente } from '@/componentes/expediente';
import { Campo, Formulario, Selector } from '@/componentes/formulario';
import { ListaDeInscripciones } from '@/componentes/inscripcion';
import { cambiarEstatusDeExpediente, cambiarPlantel, vincularCuenta } from '@/lib/acciones';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTATUS } from '@/lib/formato';

export const metadata = { title: 'Expediente' };

async function expedienteO404(matricula: string) {
  try {
    return await consultar<Esquemas['ExpedienteRespuesta']>(`/alumnos/${encodeURIComponent(matricula)}`);
  } catch (error) {
    if (error instanceof ErrorApi && (error.estado === 404 || error.estado === 400)) notFound();
    throw error;
  }
}

export default async function PaginaExpediente({ params }: Readonly<{ params: Promise<{ matricula: string }> }>) {
  const { matricula } = await params;
  const expediente = await expedienteO404(matricula);
  const [facultades, inscripciones] = await Promise.all([
    consultar<Esquemas['FacultadRespuesta'][]>('/facultades'),
    consultar<Esquemas['InscripcionRespuesta'][]>(`/alumnos/${encodeURIComponent(expediente.matricula)}/inscripciones`),
  ]);
  const matriculaOculta = <input type="hidden" name="matricula" value={expediente.matricula} />;
  return (
    <>
      <p>
        <Link href="/expedientes" prefetch={false}>
          Volver a expedientes
        </Link>
      </p>
      <h1>Expediente de {expediente.nombre}</h1>
      <DatosDelExpediente expediente={expediente} />

      <h2>Inscripciones</h2>
      <p>Consulta de la carga por periodo, con su estado. La inscripción la hace el alumno (D-14).</p>
      <ListaDeInscripciones inscripciones={inscripciones} />

      <h2>Cambiar de plantel</h2>
      <p>Cambia la facultad de este mismo expediente: la matrícula, el historial y la cuenta se conservan.</p>
      <Formulario accion={cambiarPlantel} envio="Cambiar de plantel">
        {matriculaOculta}
        <Selector
          nombre="facultadClave"
          etiqueta="Facultad destino"
          correccion="Elige la facultad destino."
          opciones={facultades
            .filter((f) => f.clave !== expediente.facultadClave)
            .map((f) => ({ valor: f.clave, etiqueta: `${f.clave} · ${f.nombre}` }))}
        />
      </Formulario>

      <h2>Cambiar estatus</h2>
      <p>Una baja puede reingresar. El egreso es definitivo.</p>
      <Formulario accion={cambiarEstatusDeExpediente} envio="Cambiar estatus">
        {matriculaOculta}
        <Selector
          nombre="estatus"
          etiqueta="Nuevo estatus"
          correccion="Elige el nuevo estatus."
          opciones={Object.entries(ETIQUETA_ESTATUS)
            .filter(([valor]) => valor !== expediente.estatus)
            .map(([valor, etiqueta]) => ({ valor, etiqueta }))}
        />
      </Formulario>

      <h2>Vincular la cuenta del alumno</h2>
      <Formulario accion={vincularCuenta} envio="Vincular cuenta">
        {matriculaOculta}
        <Campo
          nombre="correo"
          etiqueta="Correo de la cuenta de alumno"
          tipo="email"
          autoComplete="off"
          ayuda="La cuenta la da de alta el administrador del sistema, con el rol de alumno."
          correccion="Escribe un correo completo, como nombre@uaemex.mx."
        />
      </Formulario>
    </>
  );
}
