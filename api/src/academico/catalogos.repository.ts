import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../persistencia/prisma.service';

@Injectable()
export class CatalogosRepository {
  constructor(private readonly prisma: PrismaService) {}

  facultades() {
    return this.prisma.cliente().facultad.findMany({ orderBy: { clave: 'asc' } });
  }
  crearFacultad(data: Prisma.FacultadUncheckedCreateInput) {
    return this.prisma.cliente().facultad.create({ data });
  }
  planes() {
    return this.prisma.cliente().planEstudios.findMany({ orderBy: { clave: 'asc' } });
  }
  crearPlan(data: Prisma.PlanEstudiosUncheckedCreateInput) {
    return this.prisma.cliente().planEstudios.create({ data });
  }
  materias() {
    return this.prisma.cliente().materia.findMany({ orderBy: { clave: 'asc' }, include: { requiereDe: true } });
  }
  crearMateria(data: Prisma.MateriaUncheckedCreateInput) {
    return this.prisma.cliente().materia.create({ data });
  }
  prerrequisitos() {
    return this.prisma.cliente().prerequisito.findMany();
  }
  crearPrerrequisito(data: Prisma.PrerequisitoUncheckedCreateInput) {
    return this.prisma.cliente().prerequisito.create({ data });
  }
  async quitarPrerrequisito(materiaClave: string, requiereClave: string) {
    await this.prisma
      .cliente()
      .prerequisito.delete({ where: { materiaClave_requiereClave: { materiaClave, requiereClave } } });
  }
  periodos() {
    return this.prisma.cliente().periodo.findMany({ orderBy: { clave: 'desc' } });
  }
  crearPeriodo(data: Prisma.PeriodoUncheckedCreateInput) {
    return this.prisma.cliente().periodo.create({ data });
  }
}
