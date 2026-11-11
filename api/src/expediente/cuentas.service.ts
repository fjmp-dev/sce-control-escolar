import { Injectable } from '@nestjs/common';
import { OfertaService } from '../academico/oferta.service';
import { PrismaService } from '../persistencia/prisma.service';
import { PagosService } from '../pagos/pagos.service';
import { ExpedienteService } from './expediente.service';
import { InscripcionRepository } from './inscripcion.repository';

/** RF-006 desde el expediente, que sabe de quién es la sesión y quién está inscrito; los pagos los resuelve pagos. */
@Injectable()
export class CuentasService {
  constructor(
    private readonly expedientes: ExpedienteService,
    private readonly inscripciones: InscripcionRepository,
    private readonly oferta: OfertaService,
    private readonly pagos: PagosService,
    private readonly prisma: PrismaService,
  ) {}

  async matriculaDe(usuarioId: string) {
    return (await this.expedientes.delUsuario(usuarioId)).matricula;
  }

  /** Fig. 7: caja genera el cargo del periodo a cada inscrito; repetirlo no lo duplica. */
  async generarCargos(autor: string, periodoClave: string, concepto: string, importe: number) {
    await this.oferta.periodo(periodoClave); // 409 si el periodo no existe
    return this.prisma.transaccion(async () => {
      const matriculas = await this.inscripciones.matriculasDelPeriodo(periodoClave);
      let generados = 0;
      for (const matricula of matriculas) {
        if (await this.pagos.generarCargo(autor, matricula, concepto, importe)) generados += 1;
      }
      return { periodoClave, concepto, generados, yaExistian: matriculas.length - generados };
    });
  }
}
