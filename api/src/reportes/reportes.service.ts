import { Injectable, NotFoundException } from '@nestjs/common';
import { indicadores } from './dominio/indicadores';
import { ReportesRepository } from './reportes.repository';

/** RF-009: reportes agregados para dirección. Solo lectura; ningún dato de un alumno en particular. */
@Injectable()
export class ReportesService {
  constructor(private readonly reportes: ReportesRepository) {}

  async delPeriodo(periodoClave: string) {
    if ((await this.reportes.existePeriodo(periodoClave)) === 0) throw new NotFoundException();
    const filas = (await this.reportes.porFacultad(periodoClave)).map(indicadores);
    return { periodoClave, generadoEn: new Date(), filas };
  }
}
