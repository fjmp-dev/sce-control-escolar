import { applyDecorators, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsInt, Matches, Max, Min } from 'class-validator';
import { ApiErrores } from '../gateway/validacion';
import { Roles } from '../identidad/autenticacion.guard';
import { describirChoque } from './dominio/oferta';
import { OfertaService } from './oferta.service';

/** Tope de grupos por carga: más que cualquier semestre, y acota la entrada (14.3). */
export const MAXIMO_DE_GRUPOS = 15;

export class OfertaDto {
  @ApiProperty({ example: '2027A', pattern: String.raw`^\d{4}[AB]$` }) @Matches(/^\d{4}[AB]$/) periodo!: string;
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

class ChoqueRespuesta {
  @ApiProperty({ type: [Number] }) grupos!: number[];
  @ApiProperty() dia!: number;
  @ApiProperty() desde!: string;
  @ApiProperty() hasta!: string;
  @ApiProperty() descripcion!: string;
}

/** RF-003 en lo que necesita la inscripción (Batch 5): consultar la oferta y revisar choques antes de enviar. */
@ApiTags('Oferta')
@ApiErrores(401, 403)
@Controller('grupos')
export class GruposController {
  constructor(private readonly oferta: OfertaService) {}

  @Roles('alumno', 'coordinacion')
  @Get()
  @ApiOperation({ summary: 'Oferta de un periodo: grupos con cupo, ocupación y horarios' })
  @ApiResponse({ status: 200, type: [GrupoRespuesta] })
  @ApiErrores(400)
  delPeriodo(@Query() { periodo }: OfertaDto) {
    return this.oferta.delPeriodo(periodo);
  }

  @Roles('alumno')
  @Get('choques')
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
