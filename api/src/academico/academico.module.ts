import { Module } from '@nestjs/common';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { IdentidadModule } from '../identidad/identidad.module';
import { CalificacionesRepository } from './calificaciones.repository';
import { CalificacionesService } from './calificaciones.service';
import { CatalogosController } from './catalogos.controller';
import { CatalogosRepository } from './catalogos.repository';
import { CatalogosService } from './catalogos.service';
import { GruposController } from './grupos.controller';
import { OfertaRepository } from './oferta.repository';
import { OfertaService } from './oferta.service';

@Module({
  imports: [BitacoraModule, IdentidadModule],
  controllers: [CatalogosController, GruposController],
  providers: [
    CatalogosService,
    CatalogosRepository,
    OfertaService,
    OfertaRepository,
    CalificacionesService,
    CalificacionesRepository,
  ],
  exports: [OfertaService, CalificacionesService],
})
export class AcademicoModule {}
