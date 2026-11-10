import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesRepository } from './reportes.repository';
import { ReportesService } from './reportes.service';

/** Fig. 2: reportes lee por persistencia; no depende de los otros dominios. */
@Module({ controllers: [ReportesController], providers: [ReportesService, ReportesRepository] })
export class ReportesModule {}
