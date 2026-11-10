/** D-5, provisional: la mínima aprobatoria es 6.00. Todo cálculo va en centésimas, para no arrastrar errores de redondeo. */
export const MINIMA_APROBATORIA = 600;

export const aCentesimas = (valor: number) => Math.round(valor * 100);

/**
 * Tabla 16, Precisión: el único redondeo del sistema, half-up, de un cociente de enteros no negativos (D-5).
 * Promedio y avance lo usan; nadie más redondea.
 */
export function redondear(numerador: number, denominador: number): number {
  return Math.floor((2 * numerador + denominador) / (2 * denominador));
}

/** D-5: promedio a dos decimales. Recibe y devuelve centésimas. Sin valores, cero, como el historial al nacer. */
export function promedio(centesimas: readonly number[]): number {
  if (centesimas.length === 0) return 0;
  return redondear(
    centesimas.reduce((total, valor) => total + valor, 0),
    centesimas.length,
  );
}

/** D-8: avance de carrera en centésimas de porcentaje, con tope de 100 %. */
export function avance(creditosAcreditados: number, creditosDelPlan: number): number {
  if (creditosDelPlan <= 0) return 0;
  return Math.min(10_000, redondear(creditosAcreditados * 10_000, creditosDelPlan));
}

export interface CalificacionCerrada {
  folio: string;
  materiaClave: string;
  inicioDelPeriodo: Date;
  centesimas: number;
}

/** Un intento de una materia: un folio (alumno y periodo) y su final en centésimas. */
export interface Intento {
  folio: string;
  materiaClave: string;
  inicioDelPeriodo: Date;
  final: number;
}

/** D-5: la final de cada intento es el promedio de sus parciales. Solo de periodos cerrados. */
export function intentos(calificaciones: readonly CalificacionCerrada[]): Intento[] {
  const porIntento = new Map<string, { folio: string; materiaClave: string; inicio: Date; valores: number[] }>();
  for (const c of calificaciones) {
    const clave = `${c.folio}|${c.materiaClave}`;
    const intento = porIntento.get(clave) ?? {
      folio: c.folio,
      materiaClave: c.materiaClave,
      inicio: c.inicioDelPeriodo,
      valores: [],
    };
    intento.valores.push(c.centesimas);
    porIntento.set(clave, intento);
  }
  return [...porIntento.values()].map((i) => ({
    folio: i.folio,
    materiaClave: i.materiaClave,
    inicioDelPeriodo: i.inicio,
    final: promedio(i.valores),
  }));
}

/** D-5: si una materia se recursa, cuenta el último intento. Devuelve el que cuenta, por materia. */
export function vigentes<I extends Intento>(lista: readonly I[]): Map<string, I> {
  const ultimo = new Map<string, I>();
  for (const intento of lista) {
    const previo = ultimo.get(intento.materiaClave);
    if (!previo || intento.inicioDelPeriodo > previo.inicioDelPeriodo) ultimo.set(intento.materiaClave, intento);
  }
  return ultimo;
}

export const acreditado = (intento: Intento) => intento.final >= MINIMA_APROBATORIA;

/** RF-002 con D-5: materias acreditadas en periodos cerrados, para los prerrequisitos. */
export function materiasAcreditadas(calificaciones: readonly CalificacionCerrada[]): Set<string> {
  return new Set([...vigentes(intentos(calificaciones))].filter(([, i]) => acreditado(i)).map(([materia]) => materia));
}

export interface CapturaDelGrupo {
  grupoClave: string;
  materiaNombre: string;
  /** Parciales capturados de cada alumno inscrito, por folio. Un inscrito sin calificaciones lleva una lista vacía. */
  parcialesPorFolio: ReadonlyMap<string, readonly number[]>;
}

/**
 * D-16: un grupo está listo para el cierre si tiene al menos un parcial y cada inscrito tiene todos los parciales
 * que se capturaron en su grupo. Devuelve los grupos que faltan, con cuántas calificaciones les faltan.
 */
export function pendientesDeCierre(grupos: readonly CapturaDelGrupo[]): { grupo: string; faltan: number }[] {
  return grupos.flatMap(({ grupoClave, materiaNombre, parcialesPorFolio }) => {
    if (parcialesPorFolio.size === 0) return [];
    const capturados = new Set([...parcialesPorFolio.values()].flat());
    const faltan =
      capturados.size === 0
        ? parcialesPorFolio.size
        : [...parcialesPorFolio.values()].reduce(
            (total, propios) => total + [...capturados].filter((p) => !propios.includes(p)).length,
            0,
          );
    return faltan > 0 ? [{ grupo: `${materiaNombre} (grupo ${grupoClave})`, faltan }] : [];
  });
}
