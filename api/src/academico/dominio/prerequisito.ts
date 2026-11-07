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
