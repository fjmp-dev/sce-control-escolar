import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { GrupoRespuesta, IdsDeGrupo } from '../academico/grupos.controller';
import { ApiErrores, Clave, ErrorRespuesta, Matricula } from '../gateway/validacion';
import { Actual, Roles } from '../identidad/autenticacion.guard';
import { Autenticado } from '../identidad/autenticacion.service';
import { ESTADOS, MOTIVOS } from './dominio/inscripcion';
import { InscripcionService } from './inscripcion.service';

class CargaDto {
  @IdsDeGrupo() grupos!: number[];
}

class InscripcionDto extends CargaDto {
  @ApiProperty({ example: '2027A', pattern: String.raw`^\d{4}[AB]$` }) @Matches(/^\d{4}[AB]$/) periodoClave!: string;
}

class FolioParam {
  @Clave() folio!: string;
}

class MatriculaDeAlumnoParam {
  @Matricula() matricula!: string;
}

class InscripcionRespuesta {
  @ApiProperty({ example: 'INS-2027A-2420001' }) folio!: string;
  @ApiProperty() matricula!: string;
  @ApiProperty() periodoClave!: string;
  @ApiProperty({ enum: ESTADOS }) estado!: string;
  @ApiProperty({ enum: MOTIVOS, nullable: true, type: String }) motivoRechazo!: string | null;
  @ApiProperty({ format: 'date-time' }) fecha!: Date;
  @ApiProperty({ type: [GrupoRespuesta] }) grupos!: GrupoRespuesta[];
}

/** Fig. 4: el rechazo responde 409 con el estado y el motivo explícito (RNF-USU-001). */
class RechazoRespuesta extends ErrorRespuesta {
  @ApiProperty() folio!: string;
  @ApiProperty({ enum: ESTADOS, description: 'rechazada; en un ajuste rechazado, confirmada con la carga anterior' })
  estado!: string;
  @ApiProperty({ enum: MOTIVOS }) motivo!: string;
}

/** RF-002 y RNF-USU-001. El alumno se inscribe y ajusta con la matrícula de su sesión; control escolar consulta (D-14). */
@ApiTags('Inscripciones')
@ApiErrores(401, 403)
@Controller()
export class InscripcionesController {
  constructor(private readonly inscripciones: InscripcionService) {}

  @Roles('alumno')
  @Post('inscripciones')
  @ApiOperation({ summary: 'Fig. 4: enviar la carga; valida prerrequisitos, adeudos y choques, y reserva el cupo' })
  @ApiResponse({ status: 201, type: InscripcionRespuesta, description: 'Confirmada: folio y comprobante' })
  @ApiResponse({ status: 409, type: RechazoRespuesta, description: 'Rechazada, o una regla de la carga no se cumple' })
  @ApiErrores(400, 404)
  inscribir(@Body() { periodoClave, grupos }: InscripcionDto, @Actual() { usuario }: Autenticado) {
    return this.inscripciones.inscribir(usuario.id, periodoClave, grupos);
  }

  @Roles('alumno')
  @Put('inscripciones/:folio/grupos')
  @ApiOperation({ summary: 'Fig. 6: ajustar la carga confirmada mientras el periodo está abierto, y revalidarla' })
  @ApiResponse({ status: 200, type: InscripcionRespuesta })
  @ApiResponse({ status: 409, type: RechazoRespuesta, description: 'Ajuste rechazado: la carga anterior se conserva' })
  @ApiErrores(400, 404)
  ajustar(@Param() { folio }: FolioParam, @Body() { grupos }: CargaDto, @Actual() { usuario }: Autenticado) {
    return this.inscripciones.ajustar(usuario.id, folio, grupos);
  }

  @Roles('alumno')
  @Get('alumnos/actual/inscripciones')
  @ApiOperation({ summary: 'Mis inscripciones, con estado, motivo y carga' })
  @ApiResponse({ status: 200, type: [InscripcionRespuesta] })
  @ApiErrores(404)
  mias(@Actual() { usuario }: Autenticado) {
    return this.inscripciones.delUsuario(usuario.id);
  }

  @Roles('control_escolar')
  @Get('alumnos/:matricula/inscripciones')
  @ApiOperation({ summary: 'Inscripciones de un alumno (consulta, D-14)' })
  @ApiResponse({ status: 200, type: [InscripcionRespuesta] })
  @ApiErrores(400, 404)
  deAlumno(@Param() { matricula }: MatriculaDeAlumnoParam) {
    return this.inscripciones.deAlumno(matricula);
  }
}
