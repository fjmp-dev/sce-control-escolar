import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ErroresFilter } from './errores.filter';
import { MetricasController } from './metricas';
import { PeticionesMiddleware } from './peticiones.middleware';
import { SaludController } from './salud.controller';
import { validacionDeEntrada } from './validacion';

/** Tabla 28: punto único de entrada REST, validación de esquema y códigos de error de negocio. */
@Module({
  controllers: [SaludController, MetricasController],
  providers: [
    { provide: APP_PIPE, useFactory: validacionDeEntrada },
    { provide: APP_FILTER, useClass: ErroresFilter },
  ],
})
export class GatewayModule implements NestModule {
  configure(consumidor: MiddlewareConsumer) {
    consumidor.apply(PeticionesMiddleware).forRoutes('*ruta');
  }
}
