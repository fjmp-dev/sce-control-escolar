export type CodigoDeNegocio =
  | 'CREDENCIALES_INVALIDAS'
  | 'SESION_VENCIDA'
  | 'CONTRASENA_DEBIL'
  | 'REAUTENTICACION_FALLIDA'
  | 'AUTOMODIFICACION'
  | 'PRERREQUISITO_CIRCULAR'
  | 'EXPEDIENTE_NO_ACTIVO'
  | 'SIN_CAMBIO'
  | 'TRANSICION_INVALIDA'
  | 'SIN_EXPEDIENTE'
  | 'CUENTA_NO_ALUMNO'
  | 'PERIODO_NO_ABIERTO'
  | 'GRUPO_FUERA_DE_OFERTA'
  | 'CARGA_VACIA'
  | 'MATERIA_REPETIDA'
  | 'INSCRIPCION_RECHAZADA'
  | 'AJUSTE_RECHAZADO'
  | 'INSCRIPCION_CAMBIADA';

/**
 * Error de una regla de negocio. El dominio no conoce HTTP: el gateway lo traduce (Tabla 28).
 * `detalle` viaja en la respuesta, como el estado y el motivo de una inscripción rechazada (Fig. 4).
 */
export class ErrorDeNegocio extends Error {
  constructor(
    readonly codigo: CodigoDeNegocio,
    mensaje: string,
    readonly detalle?: Readonly<Record<string, string | null>>,
  ) {
    super(mensaje);
    this.name = 'ErrorDeNegocio';
  }
}
