import { Injectable } from '@nestjs/common';
import { CuentaRepository } from './cuenta.repository';
import { CuentaAlumno } from './dominio/cuenta-alumno';

/** Dominio de pagos. En el Batch 5 solo responde a la inscripción si hay adeudo (Fig. 4); el resto llega en el Batch 9. */
@Injectable()
export class PagosService {
  constructor(private readonly cuentas: CuentaRepository) {}

  /**
   * Fig. 4: consultar `cuenta_alumno`. Todo expediente nace con su cuenta; si falta, es un defecto de datos y no
   * se supone "sin adeudo" (AMFE de inscripción, modo 8).
   */
  async validarAdeudos(matricula: string): Promise<{ tieneAdeudo: boolean }> {
    const cuenta = await this.cuentas.porMatricula(matricula);
    if (!cuenta) throw new Error(`El expediente ${matricula} no tiene cuenta_alumno`);
    return { tieneAdeudo: new CuentaAlumno(Number(cuenta.saldo)).tieneAdeudo() };
  }
}
