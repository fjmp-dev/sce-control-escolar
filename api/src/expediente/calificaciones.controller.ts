import { applyDecorators, Body, Controller, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiErrores, PeriodoParam, Texto } from '../gateway/validacion';
import { Actual, Roles } from '../identidad/autenticacion.guard';
import { Autenticado } from '../identidad/autenticacion.service';
import { HistorialRespuesta, MatriculaParam } from './alumnos.controller';
import { HistorialService } from './historial.service';

const PARCIALES = 4; // D-10, provisional: hasta cuatro parciales (ck_calificacion_parcial)
const ALUMNOS_POR_CAPTURA = 200; // más que cualquier grupo; acota la entrada (14.3)

/** 0 a 10 con dos decimales a lo más (Tabla 16, Precisión; ck_calificacion_valor). */
const Valor = () =>
  applyDecorators(
    ApiProperty({ minimum: 0, maximum: 10, example: 8.5, description: 'Hasta dos decimales' }),
    IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false }),
    Min(0),
    Max(10),
  );

class GrupoParam {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) @Max(Number.MAX_SAFE_INTEGER) id!: number;
}

class CalificacionParam {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) @Max(Number.MAX_SAFE_INTEGER) id!: number;
}

class CapturaDto {
  @ApiProperty({ example: 'INS-2026B-2420001' }) @IsString() @Matches(/^[A-Za-z0-9-]{1,40}$/) folio!: string;
  @Valor() valor!: number;
}

class CapturaDeParcialDto {
  @ApiProperty({ minimum: 1, maximum: PARCIALES }) @IsInt() @Min(1) @Max(PARCIALES) parcial!: number;
  @ApiProperty({ type: [CapturaDto], minItems: 1, maxItems: ALUMNOS_POR_CAPTURA })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(ALUMNOS_POR_CAPTURA)
  @ValidateNested({ each: true })
  @Type(() => CapturaDto)
  calificaciones!: CapturaDto[];
}

class CorreccionDto {
  @Valor() valor!: number;
  @ApiProperty({ description: 'Por qué se corrige' }) @Texto(500) motivo!: string;
  @ApiProperty({ description: 'Documento que lo respalda, por ejemplo el oficio del profesor' })
  @Texto(200)
  evidencia!: string;
}

class ParcialRespuesta {
  @ApiProperty({ description: 'Identificador de la calificación, para corregirla (D-17)' }) id!: number;
  @ApiProperty() parcial!: number;
  @ApiProperty() valor!: number;
  @ApiProperty({ format: 'date-time' }) fechaCaptura!: Date;
}

class AlumnoDelGrupoRespuesta {
  @ApiProperty() folio!: string;
  @ApiProperty() matricula!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: [ParcialRespuesta] }) calificaciones!: ParcialRespuesta[];
}

class CalificacionesDelGrupoRespuesta {
  @ApiProperty() id!: number;
  @ApiProperty() clave!: string;
  @ApiProperty() materiaClave!: string;
  @ApiProperty() materiaNombre!: string;
  @ApiProperty() periodoClave!: string;
  @ApiProperty({ enum: ['abierto', 'en_curso', 'cerrado'] }) estadoPeriodo!: string;
  @ApiProperty({ type: [Number], description: 'Parciales con al menos una calificación' }) parciales!: number[];
  @ApiProperty({ type: [AlumnoDelGrupoRespuesta] }) alumnos!: AlumnoDelGrupoRespuesta[];
}

class MateriaCursadaRespuesta {
  @ApiProperty() periodoClave!: string;
  @ApiProperty({ enum: ['abierto', 'en_curso', 'cerrado'] }) estadoPeriodo!: string;
  @ApiProperty() grupoClave!: string;
  @ApiProperty() materiaClave!: string;
  @ApiProperty() materiaNombre!: string;
  @ApiProperty() creditos!: number;
  @ApiProperty({ type: [ParcialRespuesta] }) parciales!: ParcialRespuesta[];
  @ApiProperty({ nullable: true, type: Number, description: 'Solo con el periodo cerrado (D-5)' }) final!:
    number | null;
  @ApiProperty({ nullable: true, type: Boolean }) acreditada!: boolean | null;
  @ApiProperty({ nullable: true, type: Boolean, description: 'Si es el intento que cuenta (D-5)' }) vigente!:
    boolean | null;
}

class CalificacionesDelAlumnoRespuesta {
  @ApiProperty() matricula!: string;
  @ApiProperty({ type: HistorialRespuesta }) historial!: HistorialRespuesta;
  @ApiProperty({ type: [MateriaCursadaRespuesta] }) materias!: MateriaCursadaRespuesta[];
}

class CierreRespuesta {
  @ApiProperty() clave!: string;
  @ApiProperty({ enum: ['cerrado'] }) estado!: string;
  @ApiProperty({ description: 'Alumnos con el historial recalculado' }) alumnos!: number;
}

/**
 * RF-004 y RF-005. Captura del profesor en sus grupos (CF-CAL-01), consulta inmediata del alumno (CI-CAL-01),
 * cierre por coordinación con recálculo del historial (UC06, CD-DAT-02) y corrección posterior al cierre (D-17).
 */
@ApiTags('Calificaciones')
@ApiErrores(401, 403)
@Controller()
export class CalificacionesController {
  constructor(private readonly historial: HistorialService) {}

  @Roles('profesor')
  @Get('grupos/:id/calificaciones')
  @ApiOperation({ summary: 'Inscritos del grupo con sus parciales; solo para el profesor del grupo' })
  @ApiResponse({ status: 200, type: CalificacionesDelGrupoRespuesta })
  @ApiErrores(400, 404)
  delGrupo(@Param() { id }: GrupoParam, @Actual() { usuario }: Autenticado) {
    return this.historial.delGrupo(usuario.id, id);
  }

  @Roles('profesor')
  @Put('grupos/:id/calificaciones')
  @ApiOperation({ summary: 'RF-004: capturar un parcial; cada cambio queda en bitácora con su valor anterior' })
  @ApiResponse({ status: 200, type: CalificacionesDelGrupoRespuesta })
  @ApiErrores(400, 404, 409)
  capturar(
    @Param() { id }: GrupoParam,
    @Body() { parcial, calificaciones }: CapturaDeParcialDto,
    @Actual() { usuario }: Autenticado,
  ) {
    return this.historial.capturar(usuario.id, id, parcial, calificaciones);
  }

  @Roles('alumno')
  @Get('alumnos/actual/calificaciones')
  @ApiOperation({ summary: 'Calificaciones, kárdex e historial del alumno de la sesión, al momento de la captura' })
  @ApiResponse({ status: 200, type: CalificacionesDelAlumnoRespuesta })
  @ApiErrores(404)
  propias(@Actual() { usuario }: Autenticado) {
    return this.historial.delUsuario(usuario.id);
  }

  @Roles('control_escolar', 'coordinacion')
  @Get('alumnos/:matricula/calificaciones')
  @ApiOperation({ summary: 'Calificaciones, kárdex e historial de un alumno' })
  @ApiResponse({ status: 200, type: CalificacionesDelAlumnoRespuesta })
  @ApiErrores(400, 404)
  deAlumno(@Param() { matricula }: MatriculaParam) {
    return this.historial.deAlumno(matricula);
  }

  @Roles('coordinacion')
  @Post('periodos/:clave/cierre')
  @HttpCode(200)
  @ApiOperation({ summary: 'RF-005: cerrar el periodo y recalcular promedio, créditos y avance (D-16)' })
  @ApiResponse({ status: 200, type: CierreRespuesta })
  @ApiErrores(400, 409)
  async cerrar(@Param() { clave }: PeriodoParam, @Actual() { usuario }: Autenticado) {
    const { estado, alumnos } = await this.historial.cerrarPeriodo(usuario.id, clave);
    return { clave, estado, alumnos };
  }

  @Roles('coordinacion')
  @Put('calificaciones/:id/correccion')
  @ApiOperation({ summary: 'D-17: corregir una calificación de un periodo cerrado, con motivo y evidencia' })
  @ApiResponse({ status: 200, type: CalificacionesDelAlumnoRespuesta })
  @ApiErrores(400, 404, 409)
  corregir(
    @Param() { id }: CalificacionParam,
    @Body() { valor, motivo, evidencia }: CorreccionDto,
    @Actual() { usuario }: Autenticado,
  ) {
    return this.historial.corregir(usuario.id, id, valor, motivo, evidencia);
  }
}
