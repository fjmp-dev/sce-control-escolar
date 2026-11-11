import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

export const ESTATUS = ['activo', 'baja', 'egresado'] as const;
export type Estatus = (typeof ESTATUS)[number];

/** El egreso es definitivo y solo ocurre desde activo; una baja puede reingresar. */
const TRANSICIONES: Record<Estatus, readonly Estatus[]> = {
  activo: ['baja', 'egresado'],
  baja: ['activo'],
  egresado: [],
};

/** Fig. 3 y RF-001: un solo expediente por matrícula, desde el ingreso hasta el egreso. */
export class Alumno {
  constructor(
    readonly matricula: string,
    readonly facultadClave: string,
    readonly estatus: Estatus,
  ) {}

  /** Cambiar de plantel modifica este expediente; nunca crea otro (RK-01). */
  cambiarFacultad(destino: string): Alumno {
    if (this.estatus !== 'activo') {
      throw new ErrorDeNegocio(
        'EXPEDIENTE_NO_ACTIVO',
        `El expediente está en ${this.estatus}: solo un alumno activo cambia de plantel.`,
      );
    }
    if (destino === this.facultadClave) {
      throw new ErrorDeNegocio('SIN_CAMBIO', 'El alumno ya pertenece a esa facultad. Elige otra.');
    }
    return new Alumno(this.matricula, destino, this.estatus);
  }

  cambiarEstatus(nuevo: Estatus): Alumno {
    if (!TRANSICIONES[this.estatus].includes(nuevo)) {
      throw new ErrorDeNegocio(
        'TRANSICION_INVALIDA',
        this.estatus === 'egresado'
          ? 'El egreso es definitivo: el expediente ya no cambia de estatus.'
          : `Un expediente en ${this.estatus} no puede pasar a ${nuevo}.`,
      );
    }
    return new Alumno(this.matricula, this.facultadClave, nuevo);
  }
}
