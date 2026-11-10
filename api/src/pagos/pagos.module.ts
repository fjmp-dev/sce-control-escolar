import { Module } from '@nestjs/common';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { CuentaRepository } from './cuenta.repository';
import { PagosService } from './pagos.service';

@Module({ imports: [BitacoraModule], providers: [PagosService, CuentaRepository], exports: [PagosService] })
export class PagosModule {}
