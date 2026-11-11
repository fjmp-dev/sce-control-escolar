import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PeriodoParam } from '../academico/grupos.controller';
import { ApiErrores } from '../gateway/validacion';
import { Roles } from '../identidad/autenticacion.guard';
import { ReportesService } from './reportes.service';

class IndicadoresRespuesta {
  @ApiProperty({ nullable: true, type: String, description: 'Nula en la fila de toda la universidad' })
  facultadClave!: string | null;
  @ApiProperty() facultadNombre!: string;
  @ApiProperty() alumnosActivos!: number;
  @ApiProperty({ description: 'Con carga confirmada, ajustada o cerrada en el periodo' }) inscritos!: number;
  @ApiProperty({ description: 'Inscritos entre activos, en porcentaje' }) inscripcionPorcentaje!: number;
  @ApiProperty({ description: 'Media del promedio de quienes ya tienen historial' }) promedioGeneral!: number;
  @ApiProperty({ description: 'Media del avance de carrera de los activos, en porcentaje' }) avancePromedio!: number;
  @ApiProperty() cargos!: number;
  @ApiProperty() pagado!: number;
  @ApiProperty() becas!: number;
  @ApiProperty() saldoPendiente!: number;
  @ApiProperty() alumnosConAdeudo!: number;
  @ApiProperty({ description: 'Pagado y becas entre cargos, en porcentaje' }) cobranzaPorcentaje!: number;
}

class ReporteRespuesta {
  @ApiProperty() periodoClave!: string;
  @ApiProperty({ format: 'date-time' }) generadoEn!: Date;
  @ApiProperty({ type: [IndicadoresRespuesta], description: 'Una por facultad y, al final, la universidad' })
  filas!: IndicadoresRespuesta[];
}

@ApiTags('Reportes')
@ApiErrores(401, 403)
@Controller()
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Roles('direccion')
  @Get('periodos/:clave/reporte')
  @ApiOperation({ summary: 'RF-009: inscripción, avance y cobranza por facultad y de toda la universidad' })
  @ApiResponse({ status: 200, type: ReporteRespuesta })
  @ApiErrores(400, 404)
  reporte(@Param() { clave }: PeriodoParam) {
    return this.reportes.delPeriodo(clave);
  }
}
