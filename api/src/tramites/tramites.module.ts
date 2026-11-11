import { Module } from '@nestjs/common';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { ExpedienteModule } from '../expediente/expediente.module';
import { PagosModule } from '../pagos/pagos.module';
import { TramitesController } from './tramites.controller';
import { TramitesRepository } from './tramites.repository';
import { TramitesService } from './tramites.service';

/** Fig. 2: trámites usa el expediente (datos e historial) y pagos (saldo para el no adeudo). */
@Module({
  imports: [BitacoraModule, ExpedienteModule, PagosModule],
  controllers: [TramitesController],
  providers: [TramitesService, TramitesRepository],
})
export class TramitesModule {}
