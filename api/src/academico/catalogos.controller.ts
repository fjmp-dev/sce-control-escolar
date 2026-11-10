import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { ApiErrores, Clave, Texto } from '../gateway/validacion';
import { Actual, Roles } from '../identidad/autenticacion.guard';
import { Autenticado } from '../identidad/autenticacion.service';
import { ROLES } from '../identidad/dominio/usuario';
import { CatalogosService } from './catalogos.service';

const CREDITOS_MAXIMOS = 10_000; // cualquier valor mayor es un error de captura y desbordaría la columna

class FacultadDto {
  @Clave() clave!: string;
  @Texto() nombre!: string;
}

class PlanDto {
  @Clave() clave!: string;
  @Clave() facultadClave!: string;
  @ApiProperty({ minimum: 1, maximum: CREDITOS_MAXIMOS })
  @IsInt()
  @Min(1)
  @Max(CREDITOS_MAXIMOS)
  creditosTotales!: number;
  @ApiProperty({ format: 'date' }) @Type(() => Date) @IsDate() vigenteDesde!: Date;
}

class MateriaDto {
  @Clave() clave!: string;
  @Clave() planClave!: string;
  @Texto() nombre!: string;
  @ApiProperty({ minimum: 1, maximum: CREDITOS_MAXIMOS })
  @IsInt()
  @Min(1)
  @Max(CREDITOS_MAXIMOS)
  creditos!: number;
}

class MateriaParam {
  @Clave() clave!: string;
}

class PrerrequisitoParam extends MateriaParam {
  @Clave() requiere!: string;
}

class PrerrequisitoDto {
  @Clave() requiereClave!: string;
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() obligatorio?: boolean;
}

/** Fig. 7, "Abrir periodo": nace abierto y sin oferta publicada; el estado no se elige. */
class PeriodoDto {
  @ApiProperty({ example: '2027A', pattern: String.raw`^\d{4}[AB]$` }) @Matches(/^\d{4}[AB]$/) clave!: string;
  @ApiProperty({ format: 'date' }) @Type(() => Date) @IsDate() fechaInicio!: Date;
  @ApiProperty({ format: 'date' }) @Type(() => Date) @IsDate() fechaFin!: Date;
}

class FacultadRespuesta {
  @ApiProperty() clave!: string;
  @ApiProperty() nombre!: string;
}

class PlanRespuesta {
  @ApiProperty() clave!: string;
  @ApiProperty() facultadClave!: string;
  @ApiProperty() creditosTotales!: number;
  @ApiProperty({ format: 'date-time' }) vigenteDesde!: Date;
}

class PrerequisitoRespuesta {
  @ApiProperty() materiaClave!: string;
  @ApiProperty() requiereClave!: string;
  @ApiProperty() obligatorio!: boolean;
}

class MateriaRespuesta {
  @ApiProperty() clave!: string;
  @ApiProperty() planClave!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty() creditos!: number;
  @ApiProperty({ type: [PrerequisitoRespuesta], required: false }) requiereDe?: PrerequisitoRespuesta[];
}

export class PeriodoRespuesta {
  @ApiProperty() clave!: string;
  @ApiProperty({ format: 'date-time' }) fechaInicio!: Date;
  @ApiProperty({ format: 'date-time' }) fechaFin!: Date;
  @ApiProperty({ enum: ['abierto', 'en_curso', 'cerrado'] }) estado!: string;
  @ApiProperty({
    format: 'date-time',
    nullable: true,
    type: String,
    description: 'Nula mientras la oferta no se publique',
  })
  ofertaPublicadaEn!: Date | null;
}

@ApiTags('Catálogos')
@ApiErrores(401, 403)
@Controller()
export class CatalogosController {
  constructor(private readonly catalogos: CatalogosService) {}

  @Roles(...ROLES)
  @Get('facultades')
  @ApiOperation({ summary: 'Listar facultades' })
  @ApiResponse({ status: 200, type: [FacultadRespuesta] })
  facultades() {
    return this.catalogos.facultades();
  }

  @Roles('administrador')
  @Post('facultades')
  @ApiOperation({ summary: 'Dar de alta una facultad' })
  @ApiResponse({ status: 201, type: FacultadRespuesta })
  @ApiErrores(400, 409)
  crearFacultad(@Body() datos: FacultadDto, @Actual() { usuario }: Autenticado) {
    return this.catalogos.crearFacultad(usuario.id, { ...datos });
  }

  @Roles(...ROLES)
  @Get('planes')
  @ApiOperation({ summary: 'Listar planes de estudio' })
  @ApiResponse({ status: 200, type: [PlanRespuesta] })
  planes() {
    return this.catalogos.planes();
  }

  @Roles('administrador')
  @Post('planes')
  @ApiOperation({ summary: 'Dar de alta un plan de estudios' })
  @ApiResponse({ status: 201, type: PlanRespuesta })
  @ApiErrores(400, 409)
  crearPlan(@Body() datos: PlanDto, @Actual() { usuario }: Autenticado) {
    return this.catalogos.crearPlan(usuario.id, { ...datos });
  }

  @Roles(...ROLES)
  @Get('materias')
  @ApiOperation({ summary: 'Listar materias con sus prerrequisitos' })
  @ApiResponse({ status: 200, type: [MateriaRespuesta] })
  materias() {
    return this.catalogos.materias();
  }

  @Roles('coordinacion')
  @Post('materias')
  @ApiOperation({ summary: 'Dar de alta una materia' })
  @ApiResponse({ status: 201, type: MateriaRespuesta })
  @ApiErrores(400, 409)
  crearMateria(@Body() datos: MateriaDto) {
    return this.catalogos.crearMateria({ ...datos });
  }

  @Roles('coordinacion')
  @Post('materias/:clave/prerrequisitos')
  @ApiOperation({ summary: 'Agregar un prerrequisito a una materia' })
  @ApiResponse({ status: 201, type: PrerequisitoRespuesta })
  @ApiErrores(400, 409)
  agregarPrerrequisito(@Param() { clave }: MateriaParam, @Body() { requiereClave, obligatorio }: PrerrequisitoDto) {
    return this.catalogos.agregarPrerrequisito(clave, requiereClave, obligatorio ?? true);
  }

  @Roles('coordinacion')
  @Delete('materias/:clave/prerrequisitos/:requiere')
  @HttpCode(204)
  @ApiOperation({ summary: 'Quitar un prerrequisito de una materia' })
  @ApiResponse({ status: 204 })
  @ApiErrores(400, 404)
  quitarPrerrequisito(@Param() { clave, requiere }: PrerrequisitoParam) {
    return this.catalogos.quitarPrerrequisito(clave, requiere);
  }

  @Roles(...ROLES)
  @Get('periodos')
  @ApiOperation({ summary: 'Listar periodos' })
  @ApiResponse({ status: 200, type: [PeriodoRespuesta] })
  periodos() {
    return this.catalogos.periodos();
  }

  @Roles('coordinacion')
  @Post('periodos')
  @ApiOperation({ summary: 'Fig. 7: abrir un periodo; la oferta se define y se publica después' })
  @ApiResponse({ status: 201, type: PeriodoRespuesta })
  @ApiErrores(400, 409)
  abrirPeriodo(@Body() { clave, fechaInicio, fechaFin }: PeriodoDto, @Actual() { usuario }: Autenticado) {
    return this.catalogos.abrirPeriodo(usuario.id, clave, fechaInicio, fechaFin);
  }
}
