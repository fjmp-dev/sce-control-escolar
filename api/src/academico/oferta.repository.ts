import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../persistencia/prisma.service';

const GRUPO = {
  id: true,
  clave: true,
  materiaClave: true,
  periodoClave: true,
  profesorId: true,
  cupo: true,
  ocupacion: true,
  materia: { select: { nombre: true, creditos: true } },
  horarios: {
    select: { dia: true, horaInicio: true, horaFin: true, aula: true },
    orderBy: [{ dia: 'asc' }, { horaInicio: 'asc' }],
  },
} as const satisfies Prisma.GrupoSelect;

export type FilaDeGrupo = Prisma.GrupoGetPayload<{ select: typeof GRUPO }>;

/** 14.3: aísla Prisma de la oferta académica (grupos, horarios, prerrequisitos y calificaciones). */
@Injectable()
export class OfertaRepository {
  constructor(private readonly prisma: PrismaService) {}

  grupos(where: Prisma.GrupoWhereInput) {
    return this.prisma
      .cliente()
      .grupo.findMany({ where, select: GRUPO, orderBy: [{ materiaClave: 'asc' }, { clave: 'asc' }] });
  }

  periodo(clave: string) {
    return this.prisma.cliente().periodo.findUnique({ where: { clave } });
  }

  /** Serializa, dentro de la transacción, la definición y la publicación de la oferta de un periodo (D-13). */
  async bloquearPeriodo(clave: string) {
    await this.prisma.cliente().$queryRaw`SELECT clave FROM periodo WHERE clave = ${clave} FOR UPDATE`;
  }

  cambiarEstado(clave: string, estado: string) {
    return this.prisma.cliente().periodo.update({ where: { clave }, data: { estado } });
  }

  publicar(clave: string, ofertaPublicadaEn: Date) {
    return this.prisma.cliente().periodo.update({ where: { clave }, data: { ofertaPublicadaEn } });
  }

  crearGrupo(data: Prisma.GrupoUncheckedCreateInput) {
    return this.prisma.cliente().grupo.create({ data, select: GRUPO });
  }

  requisitos(materias: string[]) {
    return this.prisma.cliente().prerequisito.findMany({
      where: { materiaClave: { in: materias } },
      select: {
        materiaClave: true,
        requiereClave: true,
        obligatorio: true,
        materia: { select: { nombre: true } },
        requiere: { select: { nombre: true } },
      },
    });
  }

  /** Fig. 4: académico consulta el historial del alumno. Solo de periodos cerrados (D-5). */
  calificacionesCerradas(matricula: string) {
    return this.prisma.cliente().calificacion.findMany({
      where: { periodo: { estado: 'cerrado' }, inscripcion: { matricula } },
      select: {
        folio: true,
        valor: true,
        grupo: { select: { materiaClave: true } },
        periodo: { select: { fechaInicio: true } },
      },
    });
  }

  /** Fig. 4, "bloqueo transaccional": la fila queda bloqueada hasta el COMMIT, así que nadie más toma ese lugar. */
  async bloquear(id: number) {
    await this.prisma.cliente().$queryRaw`SELECT id FROM grupo WHERE id = ${id} FOR UPDATE`;
  }

  async ocupar(id: number, cambio: 1 | -1) {
    await this.prisma.cliente().$executeRaw`UPDATE grupo SET ocupacion = ocupacion + ${cambio} WHERE id = ${id}`;
  }
}
