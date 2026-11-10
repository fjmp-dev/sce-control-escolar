import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

/** Fig. 8: `horario.dia` va de 1, lunes, a 6, sábado. */
export const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;

/** Fig. 3. Las horas van como `HH:MM` de 24 horas, así que se comparan como texto. */
export class Horario {
  constructor(
    readonly dia: number,
    readonly horaInicio: string,
    readonly horaFin: string,
    readonly aula: string,
  ) {}

  /** RF-003 y RK-05: mismo día y los tramos se cruzan. Si una clase termina a las 9 y otra empieza a las 9, no chocan. */
  traslapaCon(otro: Horario): boolean {
    return this.dia === otro.dia && this.horaInicio < otro.horaFin && otro.horaInicio < this.horaFin;
  }
}

export interface DatosDeGrupo {
  id: number;
  clave: string;
  materiaClave: string;
  materiaNombre: string;
  creditos: number;
  cupo: number;
  ocupacion: number;
  horarios: readonly Horario[];
}

/** Fig. 3 y Tabla 29: grupo con cupo y horarios. */
export class Grupo {
  declare readonly id: number;
  declare readonly clave: string;
  declare readonly materiaClave: string;
  declare readonly materiaNombre: string;
  declare readonly creditos: number;
  declare readonly cupo: number;
  declare readonly ocupacion: number;
  declare readonly horarios: readonly Horario[];

  constructor(datos: DatosDeGrupo) {
    Object.assign(this, datos);
  }

  hayCupo(): boolean {
    return this.ocupacion < this.cupo;
  }
}

export interface Choque {
  a: Grupo;
  b: Grupo;
  dia: number;
  desde: string;
  hasta: string;
}

/** Cada par de grupos de la carga con horarios que se traslapan, con el tramo en común. */
export function choquesEntre(grupos: readonly Grupo[]): Choque[] {
  return grupos.flatMap((a, i) =>
    grupos.slice(i + 1).flatMap((b) =>
      a.horarios.flatMap((ha) =>
        b.horarios
          .filter((hb) => ha.traslapaCon(hb))
          .map((hb) => ({
            a,
            b,
            dia: ha.dia,
            desde: ha.horaInicio > hb.horaInicio ? ha.horaInicio : hb.horaInicio,
            hasta: ha.horaFin < hb.horaFin ? ha.horaFin : hb.horaFin,
          })),
      ),
    ),
  );
}

export const describirChoque = ({ a, b, dia, desde, hasta }: Choque) =>
  `${a.materiaNombre} (grupo ${a.clave}) y ${b.materiaNombre} (grupo ${b.clave}) se traslapan el ${DIAS[dia - 1]} de ${desde} a ${hasta}`;

/** Lo que D-13 necesita de cada grupo del periodo. */
export interface GrupoDefinido {
  clave: string;
  profesorId: string;
  horarios: readonly Horario[];
}

const mismaAula = (a: string, b: string) => a.trim().localeCompare(b.trim(), 'es', { sensitivity: 'base' }) === 0;
const tramo = (a: Horario, b: Horario) =>
  `el ${DIAS[a.dia - 1]} de ${a.horaInicio > b.horaInicio ? a.horaInicio : b.horaInicio} a ${a.horaFin < b.horaFin ? a.horaFin : b.horaFin}`;

/**
 * RF-003 y D-13, provisional: al definir un grupo, sus sesiones no se traslapan entre sí, y ni el aula ni el
 * profesor se traslapan con otro grupo del mismo periodo. "A1" y "a1 " son la misma aula.
 */
export function validarGrupoNuevo(
  clave: string,
  profesorId: string,
  horarios: readonly Horario[],
  delPeriodo: readonly GrupoDefinido[],
): void {
  horarios.forEach((h, i) => {
    if (h.horaFin <= h.horaInicio) {
      throw new ErrorDeNegocio(
        'RANGO_INVERTIDO',
        `La sesión del ${DIAS[h.dia - 1]} empieza a las ${h.horaInicio} y debe terminar después; termina a las ${h.horaFin}. Corrige las horas.`,
      );
    }
    const otra = horarios.slice(i + 1).find((o) => h.traslapaCon(o));
    if (otra) {
      throw new ErrorDeNegocio(
        'SESIONES_TRASLAPADAS',
        `Dos sesiones del grupo ${clave} se traslapan ${tramo(h, otra)}. Corrige el horario de una de ellas.`,
      );
    }
  });
  for (const g of delPeriodo) {
    for (const h of horarios) {
      for (const o of g.horarios.filter((x) => h.traslapaCon(x))) {
        if (mismaAula(h.aula, o.aula)) {
          throw new ErrorDeNegocio(
            'TRASLAPE_DE_AULA',
            `El aula ${o.aula} ya está ocupada ${tramo(h, o)} por el grupo ${g.clave}. Elige otra aula u otro horario.`,
          );
        }
        if (g.profesorId === profesorId) {
          throw new ErrorDeNegocio(
            'TRASLAPE_DE_PROFESOR',
            `El profesor ya imparte el grupo ${g.clave} ${tramo(h, o)}. Elige otro profesor u otro horario.`,
          );
        }
      }
    }
  }
}
