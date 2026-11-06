import { Module } from '@nestjs/common';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { CatalogosController } from './catalogos.controller';
import { CatalogosRepository } from './catalogos.repository';
import { CatalogosService } from './catalogos.service';

@Module({
  imports: [BitacoraModule],
  controllers: [CatalogosController],
  providers: [CatalogosService, CatalogosRepository],
})
export class AcademicoModule {}
