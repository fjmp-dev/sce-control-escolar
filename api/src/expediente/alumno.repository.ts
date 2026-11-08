import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../persistencia/prisma.service';

const RESUMEN = { matricula: true, nombre: true, facultadClave: true, estatus: true } as const;
const EXPEDIENTE = {
  ...RESUMEN,
  fechaIngreso: true,
  facultad: { select: { nombre: true } },
  usuario: { select: { correo: true } },
  historial: { select: { promedio: true, creditosAcumulados: true, avance: true } },
} as const;

export type FilaDeExpediente = Prisma.AlumnoGetPayload<{ select: typeof EXPEDIENTE }>;

/** 14.3: aísla Prisma del dominio de expediente. */
@Injectable()
export class AlumnoRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Por prefijo de matrícula o por parte del nombre. Tope de 50: es una búsqueda, no un listado completo. */
  buscar(texto: string | undefined) {
    const where: Prisma.AlumnoWhereInput = texto
      ? { OR: [{ matricula: { startsWith: texto } }, { nombre: { contains: texto, mode: 'insensitive' } }] }
      : {};
    return this.prisma.cliente().alumno.findMany({ where, select: RESUMEN, orderBy: { matricula: 'asc' }, take: 50 });
  }

  porMatricula(matricula: string) {
    return this.prisma.cliente().alumno.findUnique({ where: { matricula }, select: EXPEDIENTE });
  }

  porUsuario(usuarioId: string) {
    return this.prisma.cliente().alumno.findUnique({ where: { usuarioId }, select: EXPEDIENTE });
  }

  /** El expediente nace con su historial y su cuenta, en cero (Fig. 8: uno a uno). */
  crear(datos: { matricula: string; nombre: string; facultadClave: string; fechaIngreso: Date; usuarioId?: string }) {
    return this.prisma.cliente().alumno.create({
      data: { ...datos, estatus: 'activo', historial: { create: {} }, cuenta: { create: {} } },
      select: EXPEDIENTE,
    });
  }

  async actualizar(matricula: string, datos: Prisma.AlumnoUncheckedUpdateInput) {
    await this.prisma.cliente().alumno.update({ where: { matricula }, data: datos });
  }
}
