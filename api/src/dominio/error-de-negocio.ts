export type CodigoDeNegocio =
  | 'CREDENCIALES_INVALIDAS'
  | 'SESION_VENCIDA'
  | 'CONTRASENA_DEBIL'
  | 'REAUTENTICACION_FALLIDA'
  | 'AUTOMODIFICACION'
  | 'PRERREQUISITO_CIRCULAR';

/** Error de una regla de negocio. El dominio no conoce HTTP: el gateway lo traduce (Tabla 28). */
export class ErrorDeNegocio extends Error {
  constructor(
    readonly codigo: CodigoDeNegocio,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorDeNegocio';
  }
}
