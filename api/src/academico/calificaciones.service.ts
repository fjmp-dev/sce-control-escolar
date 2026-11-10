import { Injectable, NotFoundException } from '@nestjs/common';
import { BitacoraService } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { PrismaService } from '../persistencia/prisma.service';
import { CalificacionesRepository } from './calificaciones.repository';
import { aCentesimas } from './dominio/calificacion';
import { EstadoPeriodo, Periodo } from './dominio/periodo';
import { OfertaRepository } from './oferta.repository';

export interface Captura {
  folio: string;
  valor: number;
}

const valorDe = (valor: { toString(): string }) => Number(valor.toString());

/**
 * RF-004: captura de parciales por el profesor del grupo, en la ventana de captura (D-6), con autor, fecha y
 * valor anterior en bitácora (14.1-3, Tabla 38). D-17: después del cierre solo corrige coordinación.
 */
@Injectable()
export class CalificacionesService {
  constructor(
    private readonly calificaciones: CalificacionesRepository,
    private readonly oferta: OfertaRepository,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  /** RF-004 y CF-CAL-01: el grupo existe y es del profesor de la sesión. */
  async grupoDelProfesor(profesorId: string, grupoId: number) {
    const grupo = await this.calificaciones.grupo(grupoId);
    if (!grupo) throw new NotFoundException();
    if (grupo.profesorId !== profesorId) {
      throw new ErrorDeNegocio(
        'GRUPO_NO_ASIGNADO',
        'Ese grupo no está asignado a tu cuenta: solo capturas en tus grupos.',
      );
    }
    return grupo;
  }

  async delGrupo(profesorId: string, grupoId: number) {
    const grupo = await this.grupoDelProfesor(profesorId, grupoId);
    const calificaciones = await this.calificaciones.delGrupo(grupoId);
    return {
      grupo: {
        id: Number(grupo.id),
        clave: grupo.clave,
        materiaClave: grupo.materiaClave,
        materiaNombre: grupo.materia.nombre,
        periodoClave: grupo.periodoClave,
        estadoPeriodo: grupo.periodo.estado,
      },
      calificaciones: calificaciones.map((c) => ({ ...c, id: Number(c.id), valor: valorDe(c.valor) })),
    };
  }

  /** Un parcial de varios alumnos del grupo. Solo se escribe y se asienta lo que cambia. */
  async capturar(
    profesorId: string,
    grupoId: number,
    parcial: number,
    capturas: readonly Captura[],
    inscritos: ReadonlySet<string>,
  ) {
    await this.prisma.transaccion(async () => {
      const grupo = await this.grupoDelProfesor(profesorId, grupoId); // primero: a un grupo ajeno no se le revela nada
      await this.calificaciones.compartirPeriodo(grupo.periodoClave);
      const p = (await this.oferta.periodo(grupo.periodoClave))!; // releído con el periodo bloqueado
      new Periodo(
        p.clave,
        p.fechaInicio,
        p.fechaFin,
        p.estado as EstadoPeriodo,
        p.ofertaPublicadaEn,
      ).exigirVentanaDeCaptura();
      const folios = capturas.map((c) => c.folio);
      if (new Set(folios).size !== folios.length) {
        throw new ErrorDeNegocio(
          'CAPTURA_DUPLICADA',
          'Un alumno aparece dos veces en la captura. Deja una sola calificación por alumno.',
        );
      }
      const ajeno = folios.find((f) => !inscritos.has(f));
      if (ajeno) {
        throw new ErrorDeNegocio(
          'ALUMNO_NO_INSCRITO',
          `El folio ${ajeno} no está inscrito en este grupo. Actualiza la página y vuelve a capturar.`,
        );
      }
      await this.oferta.bloquear(grupoId); // dos capturas del mismo grupo se escriben una tras otra
      for (const { folio, valor } of capturas) {
        const previa = await this.calificaciones.una(folio, grupoId, parcial);
        if (previa && aCentesimas(valorDe(previa.valor)) === aCentesimas(valor)) continue;
        const { id } = previa
          ? await this.calificaciones.actualizar(previa.id, valor, profesorId)
          : await this.calificaciones.crear({
              folio,
              grupoId: BigInt(grupoId),
              profesorId,
              periodoClave: grupo.periodoClave,
              parcial,
              valor,
            });
        await this.bitacora.registrar({
          autor: profesorId,
          accion: 'captura_calificacion',
          entidad: `calificacion:${id}`,
          valorAnterior: previa
            ? {
                valor: valorDe(previa.valor),
                profesorId: previa.profesorId,
                fechaCaptura: previa.fechaCaptura.toISOString(),
              }
            : undefined,
        });
      }
    });
  }

  /** Para el kárdex y el historial: las calificaciones de los folios de un alumno. */
  deFolios(folios: readonly string[]) {
    return this.calificaciones.deFolios(folios);
  }

  /** D-16: grupos del periodo y lo capturado en cada uno. */
  async delPeriodo(periodoClave: string) {
    const [grupos, calificaciones] = await Promise.all([
      this.calificaciones.gruposDelPeriodo(periodoClave),
      this.calificaciones.delPeriodo(periodoClave),
    ]);
    return {
      grupos: grupos.map((g) => ({ id: Number(g.id), clave: g.clave, materiaNombre: g.materia.nombre })),
      calificaciones: calificaciones.map((c) => ({ folio: c.folio, grupoId: Number(c.grupoId), parcial: c.parcial })),
    };
  }

  /**
   * D-17: después del cierre, coordinación autoriza la corrección con motivo y evidencia. El profesor de origen se
   * conserva (Tabla 16, Credibilidad); quien corrige y por qué quedan en bitácora. Debe llamarse en una transacción.
   */
  async corregir(autor: string, id: number, valor: number, motivo: string, evidencia: string) {
    const actual = await this.calificaciones.porId(id);
    if (!actual) throw new NotFoundException();
    await this.calificaciones.bloquear(id);
    if (actual.periodo.estado !== 'cerrado') {
      throw new ErrorDeNegocio(
        'PERIODO_NO_CERRADO',
        `El periodo ${actual.periodo.clave} no ha cerrado: la calificación la corrige el profesor del grupo en la captura.`,
      );
    }
    if (aCentesimas(valorDe(actual.valor)) === aCentesimas(valor)) {
      throw new ErrorDeNegocio('SIN_CAMBIO', 'La calificación ya tiene ese valor.');
    }
    await this.calificaciones.actualizar(actual.id, valor);
    await this.bitacora.registrar({
      autor,
      accion: 'correccion_calificacion',
      entidad: `calificacion:${id}`,
      valorAnterior: { valor: valorDe(actual.valor), motivo, evidencia },
    });
    return { folio: actual.folio };
  }
}
