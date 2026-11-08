import { Module } from '@nestjs/common';
import { AcademicoModule } from '../academico/academico.module';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { IdentidadModule } from '../identidad/identidad.module';
import { PagosModule } from '../pagos/pagos.module';
import { AlumnoRepository } from './alumno.repository';
import { AlumnosController } from './alumnos.controller';
import { ExpedienteService } from './expediente.service';
import { InscripcionRepository } from './inscripcion.repository';
import { InscripcionService } from './inscripcion.service';
import { InscripcionesController } from './inscripciones.controller';

/** Fig. 2 con CC-014: el expediente usa los servicios de académico y pagos para validar la inscripción (Fig. 4). */
@Module({
  imports: [BitacoraModule, IdentidadModule, AcademicoModule, PagosModule],
  controllers: [AlumnosController, InscripcionesController],
  providers: [ExpedienteService, AlumnoRepository, InscripcionService, InscripcionRepository],
})
export class ExpedienteModule {}
