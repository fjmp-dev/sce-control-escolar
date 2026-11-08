/** D-5, provisional: la mínima aprobatoria es 6.00. Todo cálculo va en centésimas, para no arrastrar errores de redondeo. */
export const MINIMA_APROBATORIA = 600;

export const aCentesimas = (valor: number) => Math.round(valor * 100);

/**
 * Tabla 16 y D-5: promedio con redondeo half-up a dos decimales, en una sola función. Recibe y devuelve centésimas.
 * Sin valores, el promedio es cero, como el historial al nacer.
 */
export function promedio(centesimas: readonly number[]): number {
  if (centesimas.length === 0) return 0;
  const suma = centesimas.reduce((total, valor) => total + valor, 0);
  return Math.floor((2 * suma + centesimas.length) / (2 * centesimas.length));
}

export interface CalificacionCerrada {
  folio: string;
  materiaClave: string;
  inicioDelPeriodo: Date;
  centesimas: number;
}

/**
 * D-5: la final de una materia es el promedio de sus parciales, y si se recursa, cuenta el último intento.
 * Solo se reciben calificaciones de periodos cerrados: un periodo en curso todavía no acredita nada.
 */
export function materiasAcreditadas(calificaciones: readonly CalificacionCerrada[]): Set<string> {
  const intentos = new Map<string, { materiaClave: string; inicio: Date; valores: number[] }>();
  for (const c of calificaciones) {
    const clave = `${c.folio}|${c.materiaClave}`;
    const intento = intentos.get(clave) ?? { materiaClave: c.materiaClave, inicio: c.inicioDelPeriodo, valores: [] };
    intento.valores.push(c.centesimas);
    intentos.set(clave, intento);
  }
  const ultimo = new Map<string, { inicio: Date; valores: number[] }>();
  for (const intento of intentos.values()) {
    const previo = ultimo.get(intento.materiaClave);
    if (!previo || intento.inicio > previo.inicio) ultimo.set(intento.materiaClave, intento);
  }
  return new Set(
    [...ultimo].filter(([, intento]) => promedio(intento.valores) >= MINIMA_APROBATORIA).map(([materia]) => materia),
  );
}
