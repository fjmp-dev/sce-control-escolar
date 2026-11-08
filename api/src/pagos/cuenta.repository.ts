import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistencia/prisma.service';

/** 14.3: aísla Prisma del dominio de pagos. */
@Injectable()
export class CuentaRepository {
  constructor(private readonly prisma: PrismaService) {}

  porMatricula(matricula: string) {
    return this.prisma.cliente().cuentaAlumno.findUnique({ where: { matricula }, select: { saldo: true } });
  }
}
