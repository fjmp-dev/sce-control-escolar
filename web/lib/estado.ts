/**
 * Resultado de un formulario. `campos` son los que la API rechazó; `valores`, lo que no se debe perder al reintentar.
 * `aviso` informa sin ser error, como un choque de horario antes de enviar la carga (CF-HOR-01).
 */
export interface EstadoDeFormulario {
  exito?: string;
  error?: string;
  aviso?: string;
  campos?: string[];
  valores?: Record<string, string | string[]>;
}

export const ESTADO_INICIAL: EstadoDeFormulario = {};

/** Sesiones del formulario de grupo (RF-003): la primera es obligatoria y las demás se ignoran si quedan vacías. */
export const SESIONES_DEL_FORMULARIO = 3;
