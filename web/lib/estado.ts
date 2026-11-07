/** Resultado de un formulario. `campos` son los que la API rechazó; `valores`, lo que no se debe perder al reintentar. */
export interface EstadoDeFormulario {
  exito?: string;
  error?: string;
  campos?: string[];
  valores?: Record<string, string | string[]>;
}

export const ESTADO_INICIAL: EstadoDeFormulario = {};
