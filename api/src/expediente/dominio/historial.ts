import { acreditado, avance, Intento, promedio, vigentes } from '../../academico/dominio/calificacion';

/** Un intento con lo que su materia aporta: créditos y los créditos del plan al que pertenece (D-8). */
export interface IntentoConMateria extends Intento {
  creditos: number;
  creditosDelPlan: number;
}

/**
 * Fig. 3, `Historial.recalcular()` (RF-005). Se recalcula completo, no se acumula: el mismo resultado sin
 * importar cuántas veces se cierre o se corrija. Todo en centésimas, con el único redondeo del dominio.
 */
export class Historial {
  constructor(
    readonly promedio: number,
    readonly creditosAcumulados: number,
    readonly avance: number,
  ) {}

  /**
   * D-5: promedio de las finales vigentes; créditos de las acreditadas.
   * D-8: avance contra el plan de la materia cursada más reciente.
   */
  static recalcular(cursadas: readonly IntentoConMateria[]): Historial {
    const cuentan = [...vigentes(cursadas).values()];
    const creditos = cuentan.filter(acreditado).reduce((total, i) => total + i.creditos, 0);
    const reciente = cursadas.reduce<IntentoConMateria | undefined>(
      (ultimo, i) => (!ultimo || i.inicioDelPeriodo > ultimo.inicioDelPeriodo ? i : ultimo),
      undefined,
    );
    return new Historial(
      promedio(cuentan.map((i) => i.final)),
      creditos,
      reciente ? avance(creditos, reciente.creditosDelPlan) : 0,
    );
  }
}
