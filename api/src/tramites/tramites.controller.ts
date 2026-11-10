import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { ApiErrores, Texto } from '../gateway/validacion';
import { Actual, Roles } from '../identidad/autenticacion.guard';
import { Autenticado } from '../identidad/autenticacion.service';
import { EstadoTramite, TIPOS, TipoTramite } from './dominio/tramite';
import { TramitesService } from './tramites.service';

const ESTADOS = ['recibida', 'en_proceso', 'lista', 'entregada', 'rechazada'];

class SolicitudDto {
  @ApiProperty({ enum: TIPOS }) @IsIn(TIPOS) tipo!: TipoTramite;
}

class ColaDto {
  @ApiProperty({ enum: ESTADOS, required: false }) @IsOptional() @IsIn(ESTADOS) estado?: EstadoTramite;
}

class FolioDeTramiteParam {
  @ApiProperty({ example: 'TRA-2420001-1A2B3C4D' }) @IsString() @Matches(/^[A-Za-z0-9-]{1,40}$/) folio!: string;
}

class RechazoDto {
  @ApiProperty({ description: 'Visible para el alumno (Fig. 6)' }) @Texto(500) motivo!: string;
}

class TramiteRespuesta {
  @ApiProperty() folio!: string;
  @ApiProperty() matricula!: string;
  @ApiProperty({ enum: TIPOS }) tipo!: string;
  @ApiProperty({ enum: ESTADOS }) estado!: string;
  @ApiProperty({ nullable: true, type: String }) motivoRechazo!: string | null;
  @ApiProperty({ format: 'date-time' }) fechaSolicitud!: Date;
  @ApiProperty({ format: 'date-time' }) fechaActualizacion!: Date;
  @ApiProperty({ nullable: true, type: String }) documentoFolio!: string | null;
}

class DocumentoRespuesta {
  @ApiProperty() folio!: string;
  @ApiProperty() tramiteFolio!: string;
  @ApiProperty({ enum: TIPOS }) tipo!: string;
  @ApiProperty() contenido!: string;
  @ApiProperty({ description: 'SHA-256 del contenido' }) hash!: string;
  @ApiProperty({ format: 'date-time' }) fechaEmision!: Date;
}

class VerificacionRespuesta extends DocumentoRespuesta {
  @ApiProperty() matricula!: string;
  @ApiProperty({ description: 'El contenido guardado coincide con el hash emitido' }) valido!: boolean;
}

/** RF-007 y RF-010: constancias, no adeudo e historial, con estado y fecha visibles (Fig. 6). */
@ApiTags('Trámites')
@ApiErrores(401, 403)
@Controller()
export class TramitesController {
  constructor(private readonly tramites: TramitesService) {}

  @Roles('alumno')
  @Post('tramites')
  @ApiOperation({ summary: 'Solicitar una constancia, un no adeudo o el historial' })
  @ApiResponse({ status: 201, type: TramiteRespuesta })
  @ApiErrores(400, 404)
  solicitar(@Body() { tipo }: SolicitudDto, @Actual() { usuario }: Autenticado) {
    return this.tramites.solicitar(usuario.id, tipo);
  }

  @Roles('alumno')
  @Get('alumnos/actual/tramites')
  @ApiOperation({ summary: 'Trámites del alumno de la sesión, con estado, fechas y motivo de rechazo' })
  @ApiResponse({ status: 200, type: [TramiteRespuesta] })
  @ApiErrores(404)
  propios(@Actual() { usuario }: Autenticado) {
    return this.tramites.delUsuario(usuario.id);
  }

  @Roles('control_escolar')
  @Get('tramites')
  @ApiOperation({ summary: 'Cola de trámites, por estado' })
  @ApiResponse({ status: 200, type: [TramiteRespuesta] })
  @ApiErrores(400)
  cola(@Query() { estado }: ColaDto) {
    return this.tramites.cola(estado);
  }

  @Roles('control_escolar')
  @Post('tramites/:folio/proceso')
  @HttpCode(200)
  @ApiOperation({ summary: 'Tomar el trámite: Recibida → En proceso' })
  @ApiResponse({ status: 200, type: TramiteRespuesta })
  @ApiErrores(400, 404, 409)
  tomar(@Param() { folio }: FolioDeTramiteParam, @Actual() { usuario }: Autenticado) {
    return this.tramites.tomar(usuario.id, folio);
  }

  @Roles('control_escolar')
  @Post('tramites/:folio/emision')
  @HttpCode(200)
  @ApiOperation({ summary: 'Emitir el documento: En proceso → Lista, con folio y hash' })
  @ApiResponse({ status: 200, type: TramiteRespuesta })
  @ApiErrores(400, 404, 409)
  emitir(@Param() { folio }: FolioDeTramiteParam, @Actual() { usuario }: Autenticado) {
    return this.tramites.emitir(usuario.id, folio);
  }

  @Roles('control_escolar')
  @Post('tramites/:folio/rechazo')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rechazar con motivo visible: En proceso → Rechazada' })
  @ApiResponse({ status: 200, type: TramiteRespuesta })
  @ApiErrores(400, 404, 409)
  rechazar(
    @Param() { folio }: FolioDeTramiteParam,
    @Body() { motivo }: RechazoDto,
    @Actual() { usuario }: Autenticado,
  ) {
    return this.tramites.rechazar(usuario.id, folio, motivo);
  }

  @Roles('alumno')
  @Get('tramites/:folio/documento')
  @ApiOperation({ summary: 'Descargar el documento; la primera descarga lo deja Entregado' })
  @ApiResponse({ status: 200, type: DocumentoRespuesta })
  @ApiErrores(400, 404, 409)
  descargar(@Param() { folio }: FolioDeTramiteParam, @Actual() { usuario }: Autenticado) {
    return this.tramites.descargar(usuario.id, folio);
  }

  @Roles('control_escolar')
  @Get('documentos/:folio')
  @ApiOperation({ summary: 'Verificar un documento por su folio' })
  @ApiResponse({ status: 200, type: VerificacionRespuesta })
  @ApiErrores(400, 404)
  verificar(@Param() { folio }: FolioDeTramiteParam) {
    return this.tramites.verificar(folio);
  }
}
