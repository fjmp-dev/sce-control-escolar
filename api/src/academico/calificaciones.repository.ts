import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../persistencia/prisma.service';

const GRUPO = {
  id: true,
  clave: true,
  profesorId: true,
  periodoClave: true,
  materiaClave: true,
  materia: { select: { nombre: true, creditos: true } },
  periodo: true,
} as const satisfies Prisma.GrupoSelect;

const DE_FOLIO = {
  id: true,
  folio: true,
  grupoId: true,
  parcial: true,
  valor: true,
  fechaCaptura: true,
  grupo: {
    select: {
      materiaClave: true,
      materia: { select: { creditos: true, plan: { select: { creditosTotales: true } } } },
    },
  },
  periodo: { select: { clave: true, estado: true, fechaInicio: true } },
} as const satisfies Prisma.CalificacionSelect;

export type FilaDeCalificacion = Prisma.CalificacionGetPayload<{ select: typeof DE_FOLIO }>;

/** 14.3: aísla Prisma de las calificaciones (RF-004 y RF-005). */
@Injectable()
export class CalificacionesRepository {
  constructor(private readonly prisma: PrismaService) {}

  grupo(id: number) {
    return this.prisma.cliente().grupo.findUnique({ where: { id: BigInt(id) }, select: GRUPO });
  }

  /** Las capturas comparten el periodo; el cierre lo toma en exclusiva y espera a que terminen (D-16). */
  async compartirPeriodo(clave: string) {
    await this.prisma.cliente().$queryRaw`SELECT clave FROM periodo WHERE clave = ${clave} FOR SHARE`;
  }

  delGrupo(grupoId: number) {
    return this.prisma.cliente().calificacion.findMany({
      where: { grupoId: BigInt(grupoId) },
      select: { id: true, folio: true, parcial: true, valor: true, fechaCaptura: true },
      orderBy: [{ folio: 'asc' }, { parcial: 'asc' }],
    });
  }

  una(folio: string, grupoId: number, parcial: number) {
    return this.prisma.cliente().calificacion.findUnique({
      where: { folio_grupoId_parcial: { folio, grupoId: BigInt(grupoId), parcial } },
    });
  }

  crear(data: Prisma.CalificacionUncheckedCreateInput) {
    return this.prisma.cliente().calificacion.create({ data, select: { id: true } });
  }

  actualizar(id: bigint, valor: number, profesorId?: string) {
    return this.prisma.cliente().calificacion.update({
      where: { id },
      data: { valor, profesorId, fechaCaptura: new Date() },
      select: { id: true },
    });
  }

  deFolios(folios: readonly string[]) {
    return this.prisma.cliente().calificacion.findMany({
      where: { folio: { in: [...folios] } },
      select: DE_FOLIO,
      orderBy: [{ folio: 'asc' }, { grupoId: 'asc' }, { parcial: 'asc' }],
    });
  }

  delPeriodo(periodoClave: string) {
    return this.prisma
      .cliente()
      .calificacion.findMany({ where: { periodoClave }, select: { folio: true, grupoId: true, parcial: true } });
  }

  gruposDelPeriodo(periodoClave: string) {
    return this.prisma.cliente().grupo.findMany({
      where: { periodoClave },
      select: { id: true, clave: true, materia: { select: { nombre: true } } },
      orderBy: { clave: 'asc' },
    });
  }

  porId(id: number) {
    return this.prisma.cliente().calificacion.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, folio: true, valor: true, periodo: { select: { clave: true, estado: true } } },
    });
  }

  async bloquear(id: number) {
    await this.prisma.cliente().$queryRaw`SELECT id FROM calificacion WHERE id = ${id} FOR UPDATE`;
  }
}
