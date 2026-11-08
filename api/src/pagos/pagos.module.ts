import { Module } from '@nestjs/common';
import { CuentaRepository } from './cuenta.repository';
import { PagosService } from './pagos.service';

@Module({ providers: [PagosService, CuentaRepository], exports: [PagosService] })
export class PagosModule {}
