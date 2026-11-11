import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsString, Matches, Max, Min } from 'class-validator';
import { PeriodoParam } from '../academico/grupos.controller';
import { ApiErrores, Texto } from '../gateway/validacion';
import { Actual, Roles } from '../identidad/autenticacion.guard';
import { Autenticado } from '../identidad/autenticacion.service';
import { PagosService } from '../pagos/pagos.service';
import { MatriculaParam } from './alumnos.controller';
import { CuentasService } from './cuentas.service';

const IMPORTE_MAXIMO = 1_000_000; // acota la entrada; cualquier valor mayor es un error de captura

class Importe {
  @ApiProperty({ minimum: 0.01, maximum: IMPORTE_MAXIMO, example: 1850 })
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0.01)
  @Max(IMPORTE_MAXIMO)
  importe!: number;
}

class MovimientoDeCajaDto extends Importe {
  @ApiProperty({ example: 'Inscripción 2027A' }) @Texto(120) concepto!: string;
}

class SimulacionDto {
  @ApiProperty({ enum: ['aprobado', 'rechazado'] }) @IsIn(['aprobado', 'rechazado']) resultado!:
    'aprobado' | 'rechazado';
}

class PagoParam {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) @Max(Number.MAX_SAFE_INTEGER) id!: number;
}

class CorteDto {
  @ApiProperty({ example: '2026-11-10', format: 'date' }) @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) fecha!: string;
}

class MovimientoRespuesta {
  @ApiProperty() id!: number;
  @ApiProperty() concepto!: string;
  @ApiProperty() importe!: number;
  @ApiProperty({ enum: ['cargo', 'abono', 'ajuste', 'beca'] }) tipo!: string;
  @ApiProperty({ format: 'date-time' }) fecha!: Date;
}

class PagoRespuesta {
  @ApiProperty() id!: number;
  @ApiProperty() matricula!: string;
  @ApiProperty() referencia!: string;
  @ApiProperty() importe!: number;
  @ApiProperty({ enum: ['pendiente', 'aplicado', 'rechazado', 'cancelado'] }) estado!: string;
  @ApiProperty({ format: 'date-time' }) fecha!: Date;
  @ApiProperty({ format: 'date-time', nullable: true, type: String }) aplicadoEn!: Date | null;
}

class EstadoDeCuentaRespuesta {
  @ApiProperty() matricula!: string;
  @ApiProperty({ description: 'Mayor que cero es adeudo' }) saldo!: number;
  @ApiProperty({ type: [MovimientoRespuesta] }) movimientos!: MovimientoRespuesta[];
  @ApiProperty({ type: [PagoRespuesta] }) pagos!: PagoRespuesta[];
}

class CargosRespuesta {
  @ApiProperty() periodoClave!: string;
  @ApiProperty() concepto!: string;
  @ApiProperty() generados!: number;
  @ApiProperty() yaExistian!: number;
}

class CorteRespuesta {
  @ApiProperty() fecha!: string;
  @ApiProperty({ type: [PagoRespuesta] }) pagos!: PagoRespuesta[];
  @ApiProperty() total!: number;
}

/** RF-006 con pasarela simulada: estado de cuenta, cargos, becas, pago, recibo y corte de caja. */
@ApiTags('Pagos')
@ApiErrores(401, 403)
@Controller()
export class CuentasController {
  constructor(
    private readonly cuentas: CuentasService,
    private readonly pagos: PagosService,
  ) {}

  @Roles('alumno')
  @Get('alumnos/actual/cuenta')
  @ApiOperation({ summary: 'Estado de cuenta del alumno de la sesión' })
  @ApiResponse({ status: 200, type: EstadoDeCuentaRespuesta })
  @ApiErrores(404)
  async propia(@Actual() { usuario }: Autenticado) {
    return this.pagos.estadoDeCuenta(await this.cuentas.matriculaDe(usuario.id));
  }

  @Roles('caja')
  @Get('alumnos/:matricula/cuenta')
  @ApiOperation({ summary: 'Estado de cuenta de un alumno' })
  @ApiResponse({ status: 200, type: EstadoDeCuentaRespuesta })
  @ApiErrores(400, 404)
  deAlumno(@Param() { matricula }: MatriculaParam) {
    return this.pagos.estadoDeCuenta(matricula);
  }

  @Roles('caja')
  @Post('alumnos/:matricula/becas')
  @ApiOperation({ summary: 'Registrar una beca: abono que no deja el saldo a favor' })
  @ApiResponse({ status: 201, type: EstadoDeCuentaRespuesta })
  @ApiErrores(400, 404, 409)
  beca(
    @Param() { matricula }: MatriculaParam,
    @Body() { concepto, importe }: MovimientoDeCajaDto,
    @Actual() { usuario }: Autenticado,
  ) {
    return this.pagos.registrarBeca(usuario.id, matricula, concepto, importe);
  }

  @Roles('caja')
  @Post('periodos/:clave/cargos')
  @HttpCode(200)
  @ApiOperation({ summary: 'Fig. 7: generar el cargo del periodo a cada inscrito, una sola vez por concepto' })
  @ApiResponse({ status: 200, type: CargosRespuesta })
  @ApiErrores(400, 409)
  cargos(
    @Param() { clave }: PeriodoParam,
    @Body() { concepto, importe }: MovimientoDeCajaDto,
    @Actual() { usuario }: Autenticado,
  ) {
    return this.cuentas.generarCargos(usuario.id, clave, concepto, importe);
  }

  @Roles('alumno')
  @Post('pagos')
  @ApiOperation({ summary: 'Iniciar un pago de su adeudo; queda pendiente hasta que responde la pasarela' })
  @ApiResponse({ status: 201, type: PagoRespuesta })
  @ApiErrores(400, 409)
  async iniciar(@Body() { importe }: Importe, @Actual() { usuario }: Autenticado) {
    return this.pagos.iniciarPago(await this.cuentas.matriculaDe(usuario.id), importe);
  }

  @Roles('alumno')
  @Post('pagos/:id/simulacion')
  @HttpCode(200)
  @ApiOperation({ summary: 'Pasarela simulada: aprobar o rechazar; el pago se aplica una sola vez' })
  @ApiResponse({ status: 200, type: PagoRespuesta })
  @ApiErrores(400, 404, 409)
  async simular(@Param() { id }: PagoParam, @Body() { resultado }: SimulacionDto, @Actual() { usuario }: Autenticado) {
    return this.pagos.simular(await this.cuentas.matriculaDe(usuario.id), id, resultado);
  }

  @Roles('alumno', 'caja')
  @Get('pagos/:id')
  @ApiOperation({ summary: 'Recibo de un pago aplicado; el alumno solo ve los suyos' })
  @ApiResponse({ status: 200, type: PagoRespuesta })
  @ApiErrores(400, 404, 409)
  async recibo(@Param() { id }: PagoParam, @Actual() { usuario }: Autenticado) {
    const matricula = usuario.roles.includes('caja') ? undefined : await this.cuentas.matriculaDe(usuario.id);
    return this.pagos.recibo(id, matricula);
  }

  @Roles('caja')
  @Get('pagos')
  @ApiOperation({ summary: 'Corte de caja: pagos aplicados en un día y su total' })
  @ApiResponse({ status: 200, type: CorteRespuesta })
  @ApiErrores(400)
  corte(@Query() { fecha }: CorteDto) {
    return this.pagos.corte(fecha);
  }
}
