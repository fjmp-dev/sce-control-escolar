import { applyDecorators, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiErrores, Clave, Correo, Texto } from '../gateway/validacion';
import { Actual, Roles } from '../identidad/autenticacion.guard';
import { Autenticado } from '../identidad/autenticacion.service';
import { PeriodoRespuesta } from './catalogos.controller';
import { describirChoque } from './dominio/oferta';
import { OfertaService } from './oferta.service';

const CUPO_MAXIMO = 10_000; // cualquier valor mayor es un error de captura
const SESIONES_MAXIMAS = 12; // dos por día, de lunes a sábado

const ClaveDePeriodo = () =>
  applyDecorators(
    ApiProperty({ example: '2027A', pattern: String.raw`^\d{4}[AB]$` }),
    IsString(),
    Matches(/^\d{4}[AB]$/),
  );

const Hora = () =>
  applyDecorators(
    ApiProperty({ example: '07:00', pattern: String.raw`^([01]\d|2[0-3]):[0-5]\d$` }),
    IsString(),
    Matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  );

/** Tope de grupos por carga: más que cualquier semestre, y acota la entrada (14.3). */
export const MAXIMO_DE_GRUPOS = 15;

export class OfertaDto {
  @ClaveDePeriodo() periodo!: string;
}

class PeriodoParam {
  @ClaveDePeriodo() clave!: string;
}

class HorarioDto {
  @ApiProperty({ minimum: 1, maximum: 6, description: '1 = lunes, 6 = sábado' }) @IsInt() @Min(1) @Max(6) dia!: number;
  @Hora() horaInicio!: string;
  @Hora() horaFin!: string;
  @Texto(20)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  aula!: string;
}

class GrupoDto {
  @ClaveDePeriodo() periodoClave!: string;
  @Clave() clave!: string;
  @Clave() materiaClave!: string;
  @Correo() profesor!: string;
  @ApiProperty({ minimum: 1, maximum: CUPO_MAXIMO }) @IsInt() @Min(1) @Max(CUPO_MAXIMO) cupo!: number;
  @ApiProperty({ type: [HorarioDto], minItems: 1, maxItems: SESIONES_MAXIMAS })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(SESIONES_MAXIMAS)
  @ValidateNested({ each: true })
  @Type(() => HorarioDto)
  horarios!: HorarioDto[];
}

/** `?grupos=1&grupos=2`: con un solo valor, la consulta no llega como lista. */
export const IdsDeGrupo = () =>
  applyDecorators(
    ApiProperty({ type: [Number], minItems: 1, maxItems: MAXIMO_DE_GRUPOS, example: [1, 2] }),
    Transform(({ value }: { value: unknown }) => [value].flat().map(Number)),
    IsInt({ each: true }),
    Min(1, { each: true }),
    Max(Number.MAX_SAFE_INTEGER, { each: true }), // `1e20` es entero para JavaScript y desborda el bigint de la base
    ArrayMinSize(1),
    ArrayMaxSize(MAXIMO_DE_GRUPOS),
    ArrayUnique(),
  );

class RevisionDeCargaDto {
  @IdsDeGrupo() grupos!: number[];
}

export class HorarioRespuesta {
  @ApiProperty({ minimum: 1, maximum: 6, description: '1 = lunes, 6 = sábado' }) dia!: number;
  @ApiProperty({ example: '07:00' }) horaInicio!: string;
  @ApiProperty({ example: '09:00' }) horaFin!: string;
  @ApiProperty() aula!: string;
}

export class GrupoRespuesta {
  @ApiProperty() id!: number;
  @ApiProperty() clave!: string;
  @ApiProperty() materiaClave!: string;
  @ApiProperty() materiaNombre!: string;
  @ApiProperty() creditos!: number;
  @ApiProperty() cupo!: number;
  @ApiProperty() ocupacion!: number;
  @ApiProperty({ type: [HorarioRespuesta] }) horarios!: HorarioRespuesta[];
}

class GrupoDeOfertaRespuesta extends GrupoRespuesta {
  @ApiProperty({ description: 'Correo de la cuenta del profesor asignado' }) profesor!: string;
}

class GrupoAsignadoRespuesta extends GrupoRespuesta {
  @ApiProperty() periodoClave!: string;
}

class ChoqueRespuesta {
  @ApiProperty({ type: [Number] }) grupos!: number[];
  @ApiProperty() dia!: number;
  @ApiProperty() desde!: string;
  @ApiProperty() hasta!: string;
  @ApiProperty() descripcion!: string;
}

/**
 * RF-003 y Tabla 4, "consulta diferenciada por rol": coordinación define y publica la oferta y la ve completa;
 * el alumno ve la publicada y revisa choques antes de enviar su carga; el profesor ve sus grupos.
 */
@ApiTags('Oferta')
@ApiErrores(401, 403)
@Controller()
export class GruposController {
  constructor(private readonly oferta: OfertaService) {}

  @Roles('alumno')
  @Get('grupos')
  @ApiOperation({ summary: 'Oferta publicada de un periodo: grupos con cupo, ocupación y horarios' })
  @ApiResponse({ status: 200, type: [GrupoRespuesta], description: 'Vacía mientras la oferta no se publique' })
  @ApiErrores(400)
  publicada(@Query() { periodo }: OfertaDto) {
    return this.oferta.publicada(periodo);
  }

  @Roles('coordinacion')
  @Post('grupos')
  @ApiOperation({
    summary: 'RF-003: definir un grupo con su profesor y sus sesiones, sin traslape de aula ni de profesor',
  })
  @ApiResponse({ status: 201, type: GrupoDeOfertaRespuesta })
  @ApiErrores(400, 409)
  definir(@Body() datos: GrupoDto, @Actual() { usuario }: Autenticado) {
    return this.oferta.definirGrupo(usuario.id, datos);
  }

  @Roles('coordinacion')
  @Get('periodos/:clave/grupos')
  @ApiOperation({ summary: 'Oferta completa del periodo, publicada o no, con el profesor de cada grupo' })
  @ApiResponse({ status: 200, type: [GrupoDeOfertaRespuesta] })
  @ApiErrores(400)
  completa(@Param() { clave }: PeriodoParam) {
    return this.oferta.completa(clave);
  }

  @Roles('coordinacion')
  @Post('periodos/:clave/publicacion')
  @ApiOperation({ summary: 'Fig. 7: publicar la oferta del periodo; desde ese momento el alumno la ve y se inscribe' })
  @ApiResponse({ status: 201, type: PeriodoRespuesta })
  @ApiErrores(400, 409)
  publicar(@Param() { clave }: PeriodoParam, @Actual() { usuario }: Autenticado) {
    return this.oferta.publicarOferta(usuario.id, clave);
  }

  @Roles('profesor')
  @Get('profesores/actual/grupos')
  @ApiOperation({ summary: 'Grupos del profesor de la sesión en los periodos que no han cerrado, con su horario' })
  @ApiResponse({ status: 200, type: [GrupoAsignadoRespuesta] })
  asignados(@Actual() { usuario }: Autenticado) {
    return this.oferta.asignados(usuario.id);
  }

  @Roles('alumno')
  @Get('grupos/choques')
  @ApiOperation({ summary: 'CF-HOR-01: choques de horario de una carga, para avisar antes de enviarla' })
  @ApiResponse({ status: 200, type: [ChoqueRespuesta] })
  @ApiErrores(400)
  async choques(@Query() { grupos }: RevisionDeCargaDto) {
    return this.oferta.validarChoques(await this.oferta.grupos(grupos)).map((choque) => ({
      grupos: [choque.a.id, choque.b.id],
      dia: choque.dia,
      desde: choque.desde,
      hasta: choque.hasta,
      descripcion: describirChoque(choque),
    }));
  }
}
