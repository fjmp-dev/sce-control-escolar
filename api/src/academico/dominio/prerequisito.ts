import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

export interface Arista {
  materiaClave: string;
  requiereClave: string;
}

/**
 * RF-002: una materia no puede requerirse a sí misma, ni directa ni indirectamente,
 * porque ningún alumno podría cumplir el requisito para inscribirla.
 */
export function validarPrerequisito(materia: string, requiere: string, existentes: readonly Arista[]): void {
  const visitadas = new Set<string>();
  const pendientes = [requiere];
  while (pendientes.length > 0) {
    const actual = pendientes.pop() as string;
    if (actual === materia) {
      throw new ErrorDeNegocio(
        'PRERREQUISITO_CIRCULAR',
        `${requiere} ya depende de ${materia}, directa o indirectamente. Elige otra materia.`,
      );
    }
    if (visitadas.has(actual)) continue;
    visitadas.add(actual);
    for (const arista of existentes) if (arista.materiaClave === actual) pendientes.push(arista.requiereClave);
  }
}

export interface Requisito extends Arista {
  materiaNombre: string;
  requiereNombre: string;
  obligatorio: boolean;
}

/** RF-002 y R-03: los prerrequisitos obligatorios de la carga que el alumno no ha acreditado. */
export const faltantes = (requisitos: readonly Requisito[], acreditadas: ReadonlySet<string>) =>
  requisitos.filter((r) => r.obligatorio && !acreditadas.has(r.requiereClave));

export const describirFaltante = (r: Requisito) =>
  `Te falta acreditar ${r.requiereNombre} (${r.requiereClave}) para inscribir ${r.materiaNombre} (${r.materiaClave})`;
