import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../persistencia/prisma.service';

const INSCRIPCION = {
  folio: true,
  matricula: true,
  periodoClave: true,
  estado: true,
  motivoRechazo: true,
  fecha: true,
  grupos: { select: { grupoId: true }, orderBy: { grupoId: 'asc' } },
} as const satisfies Prisma.InscripcionSelect;

export type FilaDeInscripcion = Prisma.InscripcionGetPayload<{ select: typeof INSCRIPCION }>;

export const idsDe = (fila: FilaDeInscripcion) => fila.grupos.map((g) => Number(g.grupoId));

/** 14.3: aísla Prisma de la inscripción y su carga (`inscripcion_grupo`, Tabla 29). */
@Injectable()
export class InscripcionRepository {
  constructor(private readonly prisma: PrismaService) {}

  porFolio(folio: string) {
    return this.prisma.cliente().inscripcion.findUnique({ where: { folio }, select: INSCRIPCION });
  }

  porAlumnoYPeriodo(matricula: string, periodoClave: string) {
    return this.prisma
      .cliente()
      .inscripcion.findUnique({ where: { matricula_periodoClave: { matricula, periodoClave } }, select: INSCRIPCION });
  }

  /**
   * Candado por folio hasta el COMMIT, aunque la fila todavía no exista: dos envíos del mismo alumno se escriben
   * uno después del otro, y el segundo relee lo que dejó el primero.
   */
  async bloquear(folio: string) {
    await this.prisma.cliente().$queryRaw`SELECT 1 AS bloqueado FROM pg_advisory_xact_lock(hashtext(${folio}))`;
    return this.porFolio(folio);
  }

  deAlumno(matricula: string) {
    return this.prisma
      .cliente()
      .inscripcion.findMany({ where: { matricula }, select: INSCRIPCION, orderBy: { periodoClave: 'desc' } });
  }

  /** Guarda el estado y cambia la carga: borra los grupos que salen y agrega los que entran, sin tocar los demás. */
  async guardar(
    datos: { folio: string; matricula: string; periodoClave: string; estado: string; motivoRechazo: string | null },
    anteriores: readonly number[],
    nuevos: readonly number[],
  ) {
    const { folio, estado, motivoRechazo } = datos;
    const cliente = this.prisma.cliente();
    await cliente.inscripcion.upsert({
      where: { folio },
      create: datos,
      update: { estado, motivoRechazo, fecha: new Date() },
    });
    const salen = anteriores.filter((id) => !nuevos.includes(id)).map(BigInt);
    const entran = nuevos.filter((id) => !anteriores.includes(id)).map((id) => ({ folio, grupoId: BigInt(id) }));
    if (salen.length > 0) await cliente.inscripcionGrupo.deleteMany({ where: { folio, grupoId: { in: salen } } });
    if (entran.length > 0) await cliente.inscripcionGrupo.createMany({ data: entran });
  }
}
