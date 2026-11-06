import { Module } from '@nestjs/common';
import { AcademicoModule } from './academico/academico.module';
import { GatewayModule } from './gateway/gateway.module';
import { IdentidadModule } from './identidad/identidad.module';
import { PersistenciaModule } from './persistencia/persistencia.module';

/** Módulos de la Figura 2 y la Tabla 28. */
@Module({ imports: [PersistenciaModule, GatewayModule, IdentidadModule, AcademicoModule] })
export class AppModule {}
