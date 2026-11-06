import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BitacoraService } from '../bitacora/bitacora.service';
import { PrismaService } from '../persistencia/prisma.service';
import { CatalogosRepository } from './catalogos.repository';

/**
 * Catálogos institucionales (RNF-FLE-001). Con CC-007, el administrador da de alta facultades y planes,
 * y cada alta queda en bitácora (Parte B: acciones del administrador). Coordinación conserva materias y periodos.
 */
@Injectable()
export class CatalogosService {
  constructor(
    private readonly catalogos: CatalogosRepository,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  facultades() {
    return this.catalogos.facultades();
  }

  crearFacultad(autor: string, datos: Prisma.FacultadUncheckedCreateInput) {
    return this.prisma.transaccion(async () => {
      const creada = await this.catalogos.crearFacultad(datos);
      await this.bitacora.registrar({ autor, accion: 'alta_facultad', entidad: `facultad:${creada.clave}` });
      return creada;
    });
  }

  planes() {
    return this.catalogos.planes();
  }

  crearPlan(autor: string, datos: Prisma.PlanEstudiosUncheckedCreateInput) {
    return this.prisma.transaccion(async () => {
      const creado = await this.catalogos.crearPlan(datos);
      await this.bitacora.registrar({ autor, accion: 'alta_plan', entidad: `plan_estudios:${creado.clave}` });
      return creado;
    });
  }

  materias() {
    return this.catalogos.materias();
  }

  crearMateria(datos: Prisma.MateriaUncheckedCreateInput) {
    return this.catalogos.crearMateria(datos);
  }

  periodos() {
    return this.catalogos.periodos();
  }

  crearPeriodo(datos: Prisma.PeriodoUncheckedCreateInput) {
    return this.catalogos.crearPeriodo(datos);
  }
}
