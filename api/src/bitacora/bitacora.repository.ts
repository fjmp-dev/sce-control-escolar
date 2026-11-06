import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../persistencia/prisma.service';

export interface Asiento {
  autor: string;
  accion: string;
  entidad: string;
  valorAnterior?: Prisma.InputJsonValue;
}

@Injectable()
export class BitacoraRepository {
  constructor(private readonly prisma: PrismaService) {}

  insertar(asiento: Asiento) {
    return this.prisma.cliente().bitacora.create({ data: asiento });
  }

  contar(entidad: string, accion: string, desde: Date) {
    return this.prisma.cliente().bitacora.count({ where: { entidad, accion, fecha: { gte: desde } } });
  }
}
