import { Body, Controller, Get, Post } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsString, Matches, Min } from 'class-validator';
import { Roles } from '../auth/auth.guard';
import { PrismaService } from '../prisma.service';

// Catalogos institucionales compartidos (fase 1, RNF-FLE-001). Cualquier rol
// autenticado los lee; solo coordinacion academica los da de alta (Tabla 5).

class FacultadDto {
  @IsString() clave: string;
  @IsString() nombre: string;
}

class PlanDto {
  @IsString() clave: string;
  @IsString() facultadClave: string;
  @IsInt() @Min(1) creditosTotales: number;
  @Type(() => Date) @IsDate() vigenteDesde: Date;
}

class MateriaDto {
  @IsString() clave: string;
  @IsString() planClave: string;
  @IsString() nombre: string;
  @IsInt() @Min(1) creditos: number;
}

class PeriodoDto {
  @Matches(/^\d{4}[AB]$/) clave: string;
  @Type(() => Date) @IsDate() fechaInicio: Date;
  @Type(() => Date) @IsDate() fechaFin: Date;
  @IsIn(['abierto', 'en_curso', 'cerrado']) estado: string;
}

@Controller()
export class CatalogosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('facultades')
  facultades() {
    return this.prisma.facultad.findMany({ orderBy: { clave: 'asc' } });
  }

  @Roles('coordinacion')
  @Post('facultades')
  crearFacultad(@Body() data: FacultadDto) {
    return this.prisma.facultad.create({ data });
  }

  @Get('planes')
  planes() {
    return this.prisma.planEstudios.findMany({ orderBy: { clave: 'asc' } });
  }

  @Roles('coordinacion')
  @Post('planes')
  crearPlan(@Body() data: PlanDto) {
    return this.prisma.planEstudios.create({ data });
  }

  @Get('materias')
  materias() {
    return this.prisma.materia.findMany({ orderBy: { clave: 'asc' }, include: { requiereDe: true } });
  }

  @Roles('coordinacion')
  @Post('materias')
  crearMateria(@Body() data: MateriaDto) {
    return this.prisma.materia.create({ data });
  }

  @Get('periodos')
  periodos() {
    return this.prisma.periodo.findMany({ orderBy: { clave: 'desc' } });
  }

  @Roles('coordinacion')
  @Post('periodos')
  crearPeriodo(@Body() data: PeriodoDto) {
    return this.prisma.periodo.create({ data });
  }
}
