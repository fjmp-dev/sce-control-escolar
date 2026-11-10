import { Module } from '@nestjs/common';
import { AcademicoModule } from '../academico/academico.module';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { IdentidadModule } from '../identidad/identidad.module';
import { PagosModule } from '../pagos/pagos.module';
import { AlumnoRepository } from './alumno.repository';
import { AlumnosController } from './alumnos.controller';
import { CalificacionesController } from './calificaciones.controller';
import { CuentasController } from './cuentas.controller';
import { CuentasService } from './cuentas.service';
import { ExpedienteService } from './expediente.service';
import { HistorialService } from './historial.service';
import { InscripcionRepository } from './inscripcion.repository';
import { InscripcionService } from './inscripcion.service';
import { InscripcionesController } from './inscripciones.controller';

/**
 * Fig. 2 con CC-014: el expediente usa los servicios de académico y pagos para validar la inscripción (Fig. 4), y los
 * de académico para calificar a sus inscritos y recalcular el historial (RF-004 y RF-005).
 */
@Module({
  imports: [BitacoraModule, IdentidadModule, AcademicoModule, PagosModule],
  controllers: [AlumnosController, InscripcionesController, CalificacionesController, CuentasController],
  providers: [
    ExpedienteService,
    AlumnoRepository,
    InscripcionService,
    InscripcionRepository,
    HistorialService,
    CuentasService,
  ],
  exports: [ExpedienteService, HistorialService],
})
export class ExpedienteModule {}
