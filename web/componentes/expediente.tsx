import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTATUS, fechaLegible } from '@/lib/formato';
import { ResumenDelHistorial } from './calificaciones';
import { Insignia, tonoDeEstado } from './insignia';

/** RF-001: datos, historial y trayectoria de planteles. Lo usan control escolar y el propio alumno. */
export function DatosDelExpediente({ expediente }: Readonly<{ expediente: Esquemas['ExpedienteRespuesta'] }>) {
  const { historial, trayectoria } = expediente;
  return (
    <>
      <h2>Datos generales</h2>
      <section className="tarjeta">
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
          <dd>
            <Insignia tono={tonoDeEstado(expediente.estatus)}>
              {ETIQUETA_ESTATUS[expediente.estatus] ?? expediente.estatus}
            </Insignia>
          </dd>
          <dt>Fecha de ingreso</dt>
          <dd>{fechaLegible(expediente.fechaIngreso)}</dd>
          <dt>Cuenta del portal</dt>
          <dd>{expediente.correo ?? 'Sin cuenta vinculada'}</dd>
        </dl>
      </section>
      <h2>Historial</h2>
      <ResumenDelHistorial historial={historial} />
      <h2>Cambios de plantel</h2>
      <section className="tarjeta">
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
      </section>
    </>
  );
}
