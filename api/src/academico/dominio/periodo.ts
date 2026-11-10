import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

/** Valores de `periodo.estado` (restricción ck_periodo_estado). */
export type EstadoPeriodo = 'abierto' | 'en_curso' | 'cerrado';

/**
 * Fig. 3 y Fig. 7: coordinación abre el periodo, define la oferta y la publica. Solo con la oferta publicada
 * el alumno la consulta y se inscribe (CC-012). Al iniciar el curso termina la inscripción y empieza la captura
 * (CC-019, D-6); al cerrarse, se recalcula el historial (RF-005).
 */
export class Periodo {
  constructor(
    readonly clave: string,
    readonly fechaInicio: Date,
    readonly fechaFin: Date,
    readonly estado: EstadoPeriodo,
    readonly ofertaPublicadaEn: Date | null,
  ) {}

  static abrir(clave: string, fechaInicio: Date, fechaFin: Date): Periodo {
    if (fechaFin <= fechaInicio) {
      throw new ErrorDeNegocio(
        'RANGO_INVERTIDO',
        `La fecha de fin del periodo ${clave} debe ser posterior a la de inicio. Corrige una de las dos.`,
      );
    }
    return new Periodo(clave, fechaInicio, fechaFin, 'abierto', null);
  }

  /** La oferta se define mientras el periodo está abierto, antes o después de publicarla. */
  exigirAbierto(): void {
    if (this.estado !== 'abierto') {
      throw new ErrorDeNegocio('PERIODO_NO_ABIERTO', `El periodo ${this.clave} no está abierto.`);
    }
  }

  publicarOferta(ahora: Date): Periodo {
    this.exigirAbierto();
    if (this.ofertaPublicadaEn) {
      throw new ErrorDeNegocio('OFERTA_YA_PUBLICADA', `La oferta de ${this.clave} ya está publicada.`);
    }
    return new Periodo(this.clave, this.fechaInicio, this.fechaFin, this.estado, ahora);
  }

  /** CC-019: abierto → en curso, solo con la oferta publicada. */
  iniciarCurso(): Periodo {
    this.exigirAbierto();
    if (!this.ofertaPublicadaEn) {
      throw new ErrorDeNegocio(
        'OFERTA_NO_PUBLICADA',
        `La oferta de ${this.clave} no está publicada: nadie pudo inscribirse. Publícala antes de iniciar el curso.`,
      );
    }
    return new Periodo(this.clave, this.fechaInicio, this.fechaFin, 'en_curso', this.ofertaPublicadaEn);
  }

  /** RF-005: en curso → cerrado. Que las calificaciones estén completas lo decide quien cierra (D-16). */
  cerrar(): Periodo {
    if (this.estado !== 'en_curso') {
      throw new ErrorDeNegocio('PERIODO_NO_EN_CURSO', `El periodo ${this.clave} no está en curso: no se puede cerrar.`);
    }
    return new Periodo(this.clave, this.fechaInicio, this.fechaFin, 'cerrado', this.ofertaPublicadaEn);
  }

  /** D-6 y Tabla 15: la captura de calificaciones solo con el periodo en curso. */
  exigirVentanaDeCaptura(): void {
    if (this.estado !== 'en_curso') {
      throw new ErrorDeNegocio(
        'FUERA_DE_VENTANA',
        this.estado === 'cerrado'
          ? `El periodo ${this.clave} ya cerró. Una corrección la autoriza coordinación (D-17).`
          : `El periodo ${this.clave} todavía no está en curso: la captura empieza cuando coordinación inicia el curso.`,
      );
    }
  }

  /** D-6 y CC-012: el alumno se inscribe y ajusta con el periodo abierto y la oferta publicada. */
  exigirInscripcionAbierta(): void {
    if (this.estado !== 'abierto') {
      throw new ErrorDeNegocio('PERIODO_NO_ABIERTO', `La inscripción del periodo ${this.clave} no está abierta.`);
    }
    if (!this.ofertaPublicadaEn) {
      throw new ErrorDeNegocio(
        'OFERTA_NO_PUBLICADA',
        `La oferta de ${this.clave} todavía no se publica. Vuelve cuando coordinación la publique.`,
      );
    }
  }
}
