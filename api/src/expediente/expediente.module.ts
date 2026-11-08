import { Module } from '@nestjs/common';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { IdentidadModule } from '../identidad/identidad.module';
import { AlumnoRepository } from './alumno.repository';
import { AlumnosController } from './alumnos.controller';
import { ExpedienteService } from './expediente.service';

@Module({
  imports: [BitacoraModule, IdentidadModule],
  controllers: [AlumnosController],
  providers: [ExpedienteService, AlumnoRepository],
})
export class ExpedienteModule {}
