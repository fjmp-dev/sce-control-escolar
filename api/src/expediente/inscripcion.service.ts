import { Injectable, NotFoundException } from '@nestjs/common';
import { describirChoque, Grupo } from '../academico/dominio/oferta';
import { describirFaltante } from '../academico/dominio/prerequisito';
import { OfertaService } from '../academico/oferta.service';
import { BitacoraService } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { PagosService } from '../pagos/pagos.service';
import { PrismaService } from '../persistencia/prisma.service';
import { AlumnoRepository } from './alumno.repository';
import { EstadoInscripcion, explicarRechazo, Inscripcion, Motivo } from './dominio/inscripcion';
import { FilaDeInscripcion, idsDe, InscripcionRepository } from './inscripcion.repository';

const entidad = (folio: string) => `inscripcion:${folio}`;

/** Un folio por alumno y periodo, como la clave única `(matricula, periodo_clave)`: un doble envío no duplica. */
export const folioDe = (periodoClave: string, matricula: string) => `INS-${periodoClave}-${matricula}`;

/** Lo que se guarda como valor anterior en bitácora. */
const anterior = (fila: FilaDeInscripcion | null) =>
  fila ? { estado: fila.estado, motivo: fila.motivoRechazo, grupos: idsDe(fila) } : undefined;

/** El cupo se agotó entre la validación y el COMMIT: la transacción revierte (nota de la Fig. 4). */
class SinCupo extends Error {
  constructor(readonly grupo: Grupo) {
    super('sin cupo');
  }
}

/**
 * RF-002, Fig. 4 y 6. El expediente coordina: académico valida prerrequisitos y choques y reserva cupo; pagos
 * responde si hay adeudo. La confirmación va en una transacción con la carga y la bitácora; el rechazo, en otra (CC-013).
 */
@Injectable()
export class InscripcionService {
  constructor(
    private readonly inscripciones: InscripcionRepository,
    private readonly alumnos: AlumnoRepository,
    private readonly oferta: OfertaService,
    private readonly pagos: PagosService,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  /** El alumno, con la matrícula de su sesión (CS-SEG-03). */
  async delUsuario(usuarioId: string) {
    return this.listar((await this.expedienteDe(usuarioId)).matricula);
  }

  /** D-14, provisional: control escolar consulta; no inscribe ni ajusta. */
  async deAlumno(matricula: string) {
    if (!(await this.alumnos.porMatricula(matricula))) throw new NotFoundException();
    return this.listar(matricula);
  }

  /** Fig. 4: iniciar inscripción. Si ya hay una rechazada en el periodo, se corrige esa misma (Fig. 6, CC-013). */
  async inscribir(usuarioId: string, periodoClave: string, ids: readonly number[]) {
    const { matricula } = await this.alumnoActivo(usuarioId);
    await this.oferta.periodoAbierto(periodoClave);
    const carga = await this.oferta.carga(periodoClave, ids);
    const previa = await this.inscripciones.porAlumnoYPeriodo(matricula, periodoClave);
    const inscripcion = previa ? this.dominio(previa) : Inscripcion.nueva(folioDe(periodoClave, matricula));
    inscripcion.enviar(carga);
    return this.validarYGuardar(usuarioId, { matricula, periodoClave }, inscripcion, carga, previa);
  }

  /** Fig. 6: alta o baja de grupos dentro del plazo, y revalidación. Un folio ajeno no existe para el alumno. */
  async ajustar(usuarioId: string, folio: string, ids: readonly number[]) {
    const { matricula } = await this.alumnoActivo(usuarioId);
    const previa = await this.inscripciones.porFolio(folio);
    if (previa?.matricula !== matricula) throw new NotFoundException();
    await this.oferta.periodoAbierto(previa.periodoClave);
    const carga = await this.oferta.carga(previa.periodoClave, ids);
    const inscripcion = this.dominio(previa);
    inscripcion.ajustar(carga);
    return this.validarYGuardar(usuarioId, previa, inscripcion, carga, previa);
  }

  private async validarYGuardar(
    autor: string,
    clave: { matricula: string; periodoClave: string },
    inscripcion: Inscripcion,
    carga: Grupo[],
    previa: FilaDeInscripcion | null,
  ) {
    // Fig. 4, orden fijo: prerrequisitos, adeudos y choques. El dominio decide con lo que responde cada servicio.
    const faltantes = await this.oferta.validarPrerrequisitos(
      clave.matricula,
      carga.map((g) => g.materiaClave),
    );
    const { tieneAdeudo } = await this.pagos.validarAdeudos(clave.matricula);
    const choques = this.oferta.validarChoques(carga);
    const pasa =
      inscripcion.validarPrerrequisitos(faltantes) &&
      inscripcion.validarAdeudos(tieneAdeudo) &&
      inscripcion.validarChoques(choques);
    if (!pasa) {
      const causas: Record<Exclude<Motivo, 'cupo'>, () => string[]> = {
        prerrequisito: () => faltantes.map(describirFaltante),
        adeudo: () => ['Tienes un adeudo vigente'],
        choque: () => choques.map(describirChoque),
      };
      const motivo = inscripcion.ultimoRechazo as Exclude<Motivo, 'cupo'>;
      return this.rechazo(autor, clave, inscripcion, previa, causas[motivo]());
    }

    const reservados = previa?.estado === 'confirmada' ? idsDe(previa) : [];
    try {
      await this.prisma.transaccion(async () => {
        await this.sinCambiosDesde(previa, inscripcion.folio);
        await this.moverCupo(reservados, inscripcion.grupos, carga);
        inscripcion.confirmar();
        await this.inscripciones.guardar(
          this.datos(clave, inscripcion),
          previa ? idsDe(previa) : [],
          inscripcion.grupos,
        );
        await this.bitacora.registrar({
          autor,
          accion: reservados.length > 0 ? 'ajuste_inscripcion' : 'inscripcion_confirmada',
          entidad: entidad(inscripcion.folio),
          valorAnterior: anterior(previa),
        });
      });
    } catch (error) {
      if (!(error instanceof SinCupo)) throw error;
      inscripcion.rechazar('cupo');
      return this.rechazo(autor, clave, inscripcion, previa, [
        `El grupo ${error.grupo.clave} de ${error.grupo.materiaNombre} se quedó sin lugares`,
      ]);
    }
    return this.vista(await this.inscripciones.porFolio(inscripcion.folio));
  }

  /**
   * Reserva los grupos que entran y libera los que salen. Se recorren por id, en el mismo orden en toda
   * transacción, para que dos inscripciones simultáneas no se bloqueen entre sí.
   */
  private async moverCupo(reservados: readonly number[], nuevos: readonly number[], carga: Grupo[]) {
    const tocados = [...new Set([...reservados, ...nuevos])].sort((a, b) => a - b);
    for (const id of tocados) {
      const entra = nuevos.includes(id);
      if (entra === reservados.includes(id)) continue;
      if (!entra) await this.oferta.liberarCupo(id);
      else if (!(await this.oferta.reservarCupo(id))) throw new SinCupo(carga.find((g) => g.id === id) as Grupo);
    }
  }

  /** CC-013: el rechazo queda guardado con su motivo, en una transacción aparte. Un ajuste rechazado no cambia la carga. */
  private async rechazo(
    autor: string,
    clave: { matricula: string; periodoClave: string },
    inscripcion: Inscripcion,
    previa: FilaDeInscripcion | null,
    causas: string[],
  ): Promise<never> {
    const motivo = inscripcion.ultimoRechazo as Motivo;
    const esAjuste = inscripcion.estado === 'confirmada';
    await this.prisma.transaccion(async () => {
      await this.sinCambiosDesde(previa, inscripcion.folio);
      if (!esAjuste) {
        await this.inscripciones.guardar(
          this.datos(clave, inscripcion),
          previa ? idsDe(previa) : [],
          inscripcion.grupos,
        );
      }
      await this.bitacora.registrar({
        autor,
        accion: esAjuste ? 'ajuste_rechazado' : 'inscripcion_rechazada',
        entidad: entidad(inscripcion.folio),
        valorAnterior: anterior(previa),
      });
    });
    throw new ErrorDeNegocio(esAjuste ? 'AJUSTE_RECHAZADO' : 'INSCRIPCION_RECHAZADA', explicarRechazo(motivo, causas), {
      folio: inscripcion.folio,
      estado: inscripcion.estado,
      motivo,
    });
  }

  /**
   * Lo que se validó partió de `previa`. Si otro envío del mismo alumno la cambió mientras tanto, escribir encima
   * dejaría una carga o un cupo que no corresponden a su estado. Una inscripción nueva la protege la clave única.
   */
  private async sinCambiosDesde(previa: FilaDeInscripcion | null, folio: string) {
    const actual = await this.inscripciones.bloquear(folio);
    const version = (fila: FilaDeInscripcion | null) =>
      fila && [fila.estado, fila.motivoRechazo, ...idsDe(fila)].join();
    if (version(actual) !== version(previa)) {
      throw new ErrorDeNegocio(
        'INSCRIPCION_CAMBIADA',
        'Tu inscripción cambió mientras la enviabas. Revisa su estado y vuelve a intentarlo.',
      );
    }
  }

  private async expedienteDe(usuarioId: string) {
    const alumno = await this.alumnos.porUsuario(usuarioId);
    if (!alumno) {
      throw new ErrorDeNegocio(
        'SIN_EXPEDIENTE',
        'Tu cuenta no está vinculada a un expediente. Acude a control escolar.',
      );
    }
    return alumno;
  }

  /** Fig. 4: el expediente debe estar activo. */
  private async alumnoActivo(usuarioId: string) {
    const alumno = await this.expedienteDe(usuarioId);
    if (alumno.estatus !== 'activo') {
      throw new ErrorDeNegocio(
        'EXPEDIENTE_NO_ACTIVO',
        `Tu expediente está en ${alumno.estatus}: solo un alumno activo se inscribe. Acude a control escolar.`,
      );
    }
    return alumno;
  }

  private dominio(fila: FilaDeInscripcion) {
    return new Inscripcion(
      fila.folio,
      fila.estado as EstadoInscripcion,
      fila.motivoRechazo as Motivo | null,
      idsDe(fila),
    );
  }

  private datos(clave: { matricula: string; periodoClave: string }, inscripcion: Inscripcion) {
    return {
      folio: inscripcion.folio,
      matricula: clave.matricula,
      periodoClave: clave.periodoClave,
      estado: inscripcion.estado,
      motivoRechazo: inscripcion.motivo,
    };
  }

  private async listar(matricula: string) {
    const filas = await this.inscripciones.deAlumno(matricula);
    const grupos = await this.oferta.grupos(filas.flatMap(idsDe));
    return filas.map((fila) => this.conGrupos(fila, grupos));
  }

  /** El comprobante (Fig. 4): folio, estado, motivo y la carga con sus horarios. */
  private async vista(fila: FilaDeInscripcion | null) {
    const guardada = fila as FilaDeInscripcion;
    return this.conGrupos(guardada, await this.oferta.grupos(idsDe(guardada)));
  }

  private conGrupos(fila: FilaDeInscripcion, grupos: Grupo[]) {
    return { ...fila, grupos: idsDe(fila).map((id) => grupos.find((g) => g.id === id) as Grupo) };
  }
}
