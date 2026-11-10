import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

/** Valores de `periodo.estado` (restricción ck_periodo_estado). */
export type EstadoPeriodo = 'abierto' | 'en_curso' | 'cerrado';

/**
 * Fig. 3 y Fig. 7: coordinación abre el periodo, define la oferta y la publica. Solo con la oferta publicada
 * el alumno la consulta y se inscribe (CC-012). `cerrar()` llega con el cierre del periodo (RF-005, Batch 8).
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
