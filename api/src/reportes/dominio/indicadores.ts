import { redondear } from '../../academico/dominio/calificacion';

/** Sumas por facultad, en enteros: centésimas para promedio y avance, centavos para dinero. */
export interface Totales {
  facultadClave: string | null; // null: toda la universidad
  facultadNombre: string | null;
  activos: number;
  inscritos: number;
  conHistorial: number;
  sumaPromedios: number;
  sumaAvance: number;
  cargos: number;
  pagado: number;
  becas: number;
  pendiente: number;
  conAdeudo: number;
}

/** Media a dos decimales de valores en centésimas, con el único redondeo del sistema (Tabla 16, Precisión). */
export const media = (suma: number, n: number) => (n === 0 ? 0 : redondear(suma, n) / 100);

/** Porcentaje a dos decimales; sin base, cero. */
export const porcentaje = (parte: number, total: number) => (total === 0 ? 0 : redondear(parte * 10_000, total) / 100);

/** RF-009: indicadores de inscripción, avance y cobranza de una facultad o de la universidad. */
export const indicadores = (t: Totales) => ({
  facultadClave: t.facultadClave,
  facultadNombre: t.facultadNombre ?? 'Universidad',
  alumnosActivos: t.activos,
  inscritos: t.inscritos,
  inscripcionPorcentaje: porcentaje(t.inscritos, t.activos),
  promedioGeneral: media(t.sumaPromedios, t.conHistorial),
  avancePromedio: media(t.sumaAvance, t.activos),
  cargos: t.cargos / 100,
  pagado: t.pagado / 100,
  becas: t.becas / 100,
  saldoPendiente: t.pendiente / 100,
  alumnosConAdeudo: t.conAdeudo,
  cobranzaPorcentaje: porcentaje(t.pagado + t.becas, t.cargos),
});
