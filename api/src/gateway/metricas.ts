import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';
import { Publico } from '../identidad/autenticacion.guard';

/**
 * Tabla 57: percentil 95 por endpoint (RNF-REN-001), tasa de 5xx y de errores de negocio, y recursos del proceso.
 * La ruta es la plantilla (/alumnos/:matricula), sin identificadores; los 404 sin ruta van juntos en "sin_ruta".
 */
export const registro = new Registry();
collectDefaultMetrics({ register: registro, prefix: 'sce_' });

export const duracion = new Histogram({
  name: 'sce_http_duracion_segundos',
  help: 'Duración de las peticiones HTTP por método, ruta plantilla y estado',
  labelNames: ['metodo', 'ruta', 'estado'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 10],
  registers: [registro],
});

export const erroresDeNegocio = new Counter({
  name: 'sce_errores_negocio_total',
  help: 'Respuestas con código de error de negocio (Tabla 57)',
  labelNames: ['codigo'],
  registers: [registro],
});

/**
 * Lo lee Prometheus por la red privada (infra/monitoreo). El proxy responde 404 a /api/metricas (Fig. 9), así que no
 * sale a internet; no lleva datos personales. Fuera del OpenAPI porque no es parte del contrato.
 */
@ApiExcludeController()
@Controller('metricas')
export class MetricasController {
  @Publico()
  @Get()
  @Header('Content-Type', registro.contentType)
  metricas(): Promise<string> {
    return registro.metrics();
  }
}
