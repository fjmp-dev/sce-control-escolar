import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistencia/prisma.service';

/** 14.3: aísla Prisma del dominio de pagos. */
@Injectable()
export class CuentaRepository {
  constructor(private readonly prisma: PrismaService) {}

  porMatricula(matricula: string) {
    return this.prisma.cliente().cuentaAlumno.findUnique({ where: { matricula }, select: { saldo: true } });
  }

  /** Los cambios de saldo de una cuenta se escriben uno tras otro. */
  async bloquear(matricula: string) {
    await this.prisma.cliente()
      .$queryRaw`SELECT matricula FROM cuenta_alumno WHERE matricula = ${matricula} FOR UPDATE`;
  }

  estado(matricula: string) {
    return this.prisma.cliente().cuentaAlumno.findUnique({
      where: { matricula },
      select: {
        matricula: true,
        saldo: true,
        movimientos: {
          orderBy: { id: 'desc' },
          select: { id: true, concepto: true, importe: true, tipo: true, fecha: true },
        },
        alumno: { select: { pagos: { orderBy: { id: 'desc' }, select: PAGO } } },
      },
    });
  }

  /** Cargo o abono con su efecto en el saldo: el saldo siempre cuadra con los movimientos. */
  async movimiento(datos: { matricula: string; concepto: string; importe: number; tipo: string; pagoId?: bigint }) {
    const signo = datos.tipo === 'cargo' ? 1 : -1;
    await this.prisma.cliente().movimiento.create({ data: datos });
    await this.prisma.cliente().cuentaAlumno.update({
      where: { matricula: datos.matricula },
      data: { saldo: { increment: signo * datos.importe } },
    });
  }

  tieneCargo(matricula: string, concepto: string) {
    return this.prisma.cliente().movimiento.count({ where: { matricula, concepto, tipo: 'cargo' } });
  }

  crearPago(data: { matricula: string; claveIdempotencia: string; referencia: string; importe: number }) {
    return this.prisma.cliente().pago.create({ data: { ...data, estado: 'pendiente' }, select: PAGO });
  }

  async bloquearPago(id: number) {
    await this.prisma.cliente().$queryRaw`SELECT id FROM pago WHERE id = ${id} FOR UPDATE`;
  }

  pago(id: number) {
    return this.prisma.cliente().pago.findUnique({ where: { id: BigInt(id) }, select: PAGO });
  }

  cambiarEstado(id: bigint, estado: string) {
    return this.prisma.cliente().pago.update({ where: { id }, data: { estado }, select: PAGO });
  }

  aplicadosEntre(desde: Date, hasta: Date) {
    return this.prisma.cliente().pago.findMany({
      where: { estado: 'aplicado', movimiento: { fecha: { gte: desde, lt: hasta } } },
      select: PAGO,
      orderBy: { id: 'asc' },
    });
  }
}

const PAGO = {
  id: true,
  matricula: true,
  referencia: true,
  importe: true,
  estado: true,
  fecha: true,
  movimiento: { select: { fecha: true } },
} as const;
