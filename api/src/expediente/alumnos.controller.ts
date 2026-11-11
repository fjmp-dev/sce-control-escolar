import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional } from 'class-validator';
import { ApiErrores, Clave, Correo, Matricula, Texto } from '../gateway/validacion';
import { Actual, Roles } from '../identidad/autenticacion.guard';
import { Autenticado } from '../identidad/autenticacion.service';
import { ESTATUS, type Estatus } from './dominio/alumno';
import { ExpedienteService } from './expediente.service';

class BusquedaDeAlumnoDto {
  @IsOptional() @Texto(100) buscar?: string;
}

export class MatriculaParam {
  @Matricula() matricula!: string;
}

class AltaAlumnoDto {
  @Matricula() matricula!: string;
  @Texto(150) nombre!: string;
  @Clave() facultadClave!: string;
  @ApiProperty({ format: 'date' }) @Type(() => Date) @IsDate() fechaIngreso!: Date;
  @IsOptional() @Correo(false) correo?: string;
}

class CambioDePlantelDto {
  @Clave() facultadClave!: string;
}

class CambioDeEstatusDto {
  @ApiProperty({ enum: ESTATUS }) @IsIn(ESTATUS) estatus!: Estatus;
}

class VinculoDeCuentaDto {
  @Correo() correo!: string;
}

class AlumnoResumen {
  @ApiProperty() matricula!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty() facultadClave!: string;
  @ApiProperty({ enum: ESTATUS }) estatus!: string;
}

export class HistorialRespuesta {
  @ApiProperty() promedio!: number;
  @ApiProperty() creditosAcumulados!: number;
  @ApiProperty() avance!: number;
}

class CambioDePlantel {
  @ApiProperty() de!: string;
  @ApiProperty() a!: string;
  @ApiProperty({ format: 'date-time' }) fecha!: Date;
}

class ExpedienteRespuesta extends AlumnoResumen {
  @ApiProperty() facultadNombre!: string;
  @ApiProperty({ format: 'date-time' }) fechaIngreso!: Date;
  @ApiProperty({ type: String, nullable: true }) correo!: string | null;
  @ApiProperty({ type: HistorialRespuesta }) historial!: HistorialRespuesta;
  @ApiProperty({ type: [CambioDePlantel] }) trayectoria!: CambioDePlantel[];
}

/** RF-001. Control escolar administra expedientes (Tabla 5; Fig. 1, UC14); el alumno consulta solo el suyo (Tabla 16). */
@ApiTags('Expedientes')
@ApiErrores(401, 403)
@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly expedientes: ExpedienteService) {}

  @Roles('control_escolar')
  @Get()
  @ApiOperation({ summary: 'Buscar expedientes por matrícula o nombre (hasta 50)' })
  @ApiResponse({ status: 200, type: [AlumnoResumen] })
  @ApiErrores(400)
  buscar(@Query() { buscar }: BusquedaDeAlumnoDto) {
    return this.expedientes.buscar(buscar);
  }

  @Roles('control_escolar')
  @Post()
  @ApiOperation({ summary: 'Dar de alta un expediente, con su historial y su cuenta en cero' })
  @ApiResponse({ status: 201, type: ExpedienteRespuesta })
  @ApiErrores(400, 409)
  alta(@Body() datos: AltaAlumnoDto, @Actual() { usuario }: Autenticado) {
    return this.expedientes.alta(usuario.id, { ...datos });
  }

  @Roles('alumno')
  @Get('actual')
  @ApiOperation({ summary: 'Mi expediente' })
  @ApiResponse({ status: 200, type: ExpedienteRespuesta })
  @ApiErrores(404)
  actual(@Actual() { usuario }: Autenticado) {
    return this.expedientes.delUsuario(usuario.id);
  }

  @Roles('control_escolar')
  @Get(':matricula')
  @ApiOperation({ summary: 'Consultar un expediente' })
  @ApiResponse({ status: 200, type: ExpedienteRespuesta })
  @ApiErrores(400, 404)
  consultar(@Param() { matricula }: MatriculaParam) {
    return this.expedientes.consultar(matricula);
  }

  @Roles('control_escolar')
  @Put(':matricula/facultad')
  @ApiOperation({ summary: 'Cambiar de plantel el mismo expediente, con bitácora' })
  @ApiResponse({ status: 200, type: ExpedienteRespuesta })
  @ApiErrores(400, 404, 409)
  cambiarFacultad(
    @Param() { matricula }: MatriculaParam,
    @Body() { facultadClave }: CambioDePlantelDto,
    @Actual() { usuario }: Autenticado,
  ) {
    return this.expedientes.cambiarFacultad(usuario.id, matricula, facultadClave);
  }

  @Roles('control_escolar')
  @Put(':matricula/estatus')
  @ApiOperation({ summary: 'Cambiar el estatus: baja, reingreso o egreso, con bitácora' })
  @ApiResponse({ status: 200, type: ExpedienteRespuesta })
  @ApiErrores(400, 404, 409)
  cambiarEstatus(
    @Param() { matricula }: MatriculaParam,
    @Body() { estatus }: CambioDeEstatusDto,
    @Actual() { usuario }: Autenticado,
  ) {
    return this.expedientes.cambiarEstatus(usuario.id, matricula, estatus);
  }

  @Roles('control_escolar')
  @Put(':matricula/cuenta')
  @ApiOperation({ summary: 'Vincular la cuenta de alumno con la que la persona consulta su expediente' })
  @ApiResponse({ status: 200, type: ExpedienteRespuesta })
  @ApiErrores(400, 404, 409)
  vincular(
    @Param() { matricula }: MatriculaParam,
    @Body() { correo }: VinculoDeCuentaDto,
    @Actual() { usuario }: Autenticado,
  ) {
    return this.expedientes.vincularCuenta(usuario.id, matricula, correo);
  }
}
