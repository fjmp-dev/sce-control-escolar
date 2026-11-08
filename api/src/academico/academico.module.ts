import { Module } from '@nestjs/common';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { CatalogosController } from './catalogos.controller';
import { CatalogosRepository } from './catalogos.repository';
import { CatalogosService } from './catalogos.service';
import { GruposController } from './grupos.controller';
import { OfertaRepository } from './oferta.repository';
import { OfertaService } from './oferta.service';

@Module({
  imports: [BitacoraModule],
  controllers: [CatalogosController, GruposController],
  providers: [CatalogosService, CatalogosRepository, OfertaService, OfertaRepository],
  exports: [OfertaService],
})
export class AcademicoModule {}
