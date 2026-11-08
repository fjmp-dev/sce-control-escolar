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
