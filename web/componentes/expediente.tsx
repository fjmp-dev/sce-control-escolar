import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTATUS, fechaLegible } from '@/lib/formato';

/** RF-001: datos, historial y trayectoria de planteles. Lo usan control escolar y el propio alumno. */
export function DatosDelExpediente({ expediente }: Readonly<{ expediente: Esquemas['ExpedienteRespuesta'] }>) {
  const { historial, trayectoria } = expediente;
  return (
    <>
      <dl className="datos">
        <dt>Matrícula</dt>
        <dd>{expediente.matricula}</dd>
        <dt>Nombre</dt>
        <dd>{expediente.nombre}</dd>
        <dt>Facultad</dt>
        <dd>
          {expediente.facultadNombre} ({expediente.facultadClave})
        </dd>
        <dt>Estatus</dt>
        <dd>{ETIQUETA_ESTATUS[expediente.estatus] ?? expediente.estatus}</dd>
        <dt>Fecha de ingreso</dt>
        <dd>{fechaLegible(expediente.fechaIngreso)}</dd>
        <dt>Cuenta del portal</dt>
        <dd>{expediente.correo ?? 'Sin cuenta vinculada'}</dd>
      </dl>
      <h2>Historial</h2>
      <dl className="datos">
        <dt>Promedio</dt>
        <dd>{historial.promedio.toFixed(2)}</dd>
        <dt>Créditos acumulados</dt>
        <dd>{historial.creditosAcumulados}</dd>
        <dt>Avance de carrera</dt>
        <dd>{historial.avance.toFixed(2)} %</dd>
      </dl>
      <h2>Cambios de plantel</h2>
      {trayectoria.length === 0 ? (
        <p>Sin cambios de plantel.</p>
      ) : (
        <ol>
          {trayectoria.map((cambio) => (
            <li key={cambio.fecha}>
              De {cambio.de} a {cambio.a}, el {fechaLegible(cambio.fecha)}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
