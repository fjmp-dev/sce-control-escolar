import { Module } from '@nestjs/common';
import { BitacoraRepository } from './bitacora.repository';
import { BitacoraService } from './bitacora.service';

@Module({ providers: [BitacoraRepository, BitacoraService], exports: [BitacoraService] })
export class BitacoraModule {}
