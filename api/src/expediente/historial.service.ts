import { Injectable } from '@nestjs/common';
import { CalificacionesService, Captura } from '../academico/calificaciones.service';
import { aCentesimas, acreditado, intentos, pendientesDeCierre, vigentes } from '../academico/dominio/calificacion';
import { OfertaService } from '../academico/oferta.service';
import { BitacoraService } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { PrismaService } from '../persistencia/prisma.service';
import { AlumnoRepository } from './alumno.repository';
import { Historial } from './dominio/historial';
import { ExpedienteService } from './expediente.service';
import { InscripcionRepository } from './inscripcion.repository';

const VIGENTES = ['confirmada', 'ajustada', 'cerrada'];
const aDecimal = (centesimas: number) => centesimas / 100;

/**
 * RF-004 y RF-005 desde el expediente, que conoce a los inscritos y al historial, y usa a académico, que conoce
 * grupos, periodos y calificaciones (Fig. 2: el expediente depende de académico, nunca al revés).
 */
@Injectable()
export class HistorialService {
  constructor(
    private readonly expedientes: ExpedienteService,
    private readonly alumnos: AlumnoRepository,
    private readonly inscripciones: InscripcionRepository,
    private readonly calificaciones: CalificacionesService,
    private readonly oferta: OfertaService,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  /** RF-004: el grupo del profesor con sus inscritos y lo capturado. */
  async delGrupo(profesorId: string, grupoId: number) {
    const { grupo, calificaciones } = await this.calificaciones.delGrupo(profesorId, grupoId);
    const inscritos = await this.inscripciones.inscritosDelGrupo(grupoId);
    const parciales = [...new Set(calificaciones.map((c) => c.parcial))].sort((a, b) => a - b);
    return {
      ...grupo,
      parciales,
      alumnos: inscritos.map((a) => ({
        ...a,
        calificaciones: calificaciones
          .filter((c) => c.folio === a.folio)
          .map(({ id, parcial, valor, fechaCaptura }) => ({ id, parcial, valor, fechaCaptura })),
      })),
    };
  }

  /** RF-004: solo las cargas confirmadas se califican; el alumno la consulta al momento del COMMIT (CI-CAL-01). */
  async capturar(profesorId: string, grupoId: number, parcial: number, capturas: readonly Captura[]) {
    const inscritos = await this.inscripciones.inscritosDelGrupo(grupoId, ['confirmada']);
    await this.calificaciones.capturar(profesorId, grupoId, parcial, capturas, new Set(inscritos.map((i) => i.folio)));
    return this.delGrupo(profesorId, grupoId);
  }

  /** Consulta inmediata y kárdex del alumno de la sesión (RF-004, Tabla 4). */
  async delUsuario(usuarioId: string) {
    const { matricula } = await this.expedientes.delUsuario(usuarioId);
    return this.deAlumno(matricula);
  }

  /**
   * Cada materia de las cargas vigentes, con sus parciales. Con el periodo cerrado, también la final, si acreditó y si
   * es el intento que cuenta (D-5). El historial es el que dejó el último cierre o corrección.
   */
  async deAlumno(matricula: string) {
    const { historial } = await this.expedientes.consultar(matricula);
    const cargas = (await this.inscripciones.deAlumno(matricula)).filter((i) => VIGENTES.includes(i.estado));
    const filas = await this.calificaciones.deFolios(cargas.map((i) => i.folio));
    const grupos = await this.oferta.grupos(cargas.flatMap((i) => i.grupos.map((g) => Number(g.grupoId))));
    const estados = new Map(
      await Promise.all(
        [...new Set(cargas.map((i) => i.periodoClave))].map(
          async (p) => [p, (await this.oferta.periodo(p)).estado] as const,
        ),
      ),
    );
    const cursadas = intentos(
      filas
        .filter((f) => f.periodo.estado === 'cerrado')
        .map((f) => ({
          folio: f.folio,
          materiaClave: f.grupo.materiaClave,
          inicioDelPeriodo: f.periodo.fechaInicio,
          centesimas: aCentesimas(Number(f.valor)),
        })),
    );
    const cuentan = new Set(vigentes(cursadas).values());
    const materias = cargas.flatMap((carga) =>
      carga.grupos.map(({ grupoId }) => {
        const grupo = grupos.find((g) => g.id === Number(grupoId));
        const intento = cursadas.find((i) => i.folio === carga.folio && i.materiaClave === grupo?.materiaClave);
        return {
          periodoClave: carga.periodoClave,
          estadoPeriodo: estados.get(carga.periodoClave) ?? '',
          grupoClave: grupo?.clave ?? '',
          materiaClave: grupo?.materiaClave ?? '',
          materiaNombre: grupo?.materiaNombre ?? '',
          creditos: grupo?.creditos ?? 0,
          parciales: filas
            .filter((f) => f.folio === carga.folio && f.grupoId === grupoId)
            .map((f) => ({
              id: Number(f.id),
              parcial: f.parcial,
              valor: Number(f.valor),
              fechaCaptura: f.fechaCaptura,
            })),
          final: intento ? aDecimal(intento.final) : null,
          acreditada: intento ? acreditado(intento) : null,
          vigente: intento ? cuentan.has(intento) : null,
        };
      }),
    );
    return { matricula, historial, materias };
  }

  /** Fig. 3, `Historial.recalcular()`. Si cambia, queda en bitácora con el valor anterior (Tabla 16, Trazabilidad). */
  async recalcular(autor: string, matricula: string) {
    const folios = (await this.inscripciones.deAlumno(matricula)).map((i) => i.folio);
    const filas = (await this.calificaciones.deFolios(folios)).filter((f) => f.periodo.estado === 'cerrado');
    const plan = new Map(filas.map((f) => [f.grupo.materiaClave, f.grupo.materia]));
    const nuevo = Historial.recalcular(
      intentos(
        filas.map((f) => ({
          folio: f.folio,
          materiaClave: f.grupo.materiaClave,
          inicioDelPeriodo: f.periodo.fechaInicio,
          centesimas: aCentesimas(Number(f.valor)),
        })),
      ).map((i) => ({
        ...i,
        creditos: plan.get(i.materiaClave)?.creditos ?? 0,
        creditosDelPlan: plan.get(i.materiaClave)?.plan.creditosTotales ?? 0,
      })),
    );
    const anterior = await this.alumnos.historial(matricula);
    const datos = {
      promedio: aDecimal(nuevo.promedio),
      creditosAcumulados: nuevo.creditosAcumulados,
      avance: aDecimal(nuevo.avance),
    };
    const previo = {
      promedio: Number(anterior.promedio),
      creditosAcumulados: anterior.creditosAcumulados,
      avance: Number(anterior.avance),
    };
    if (JSON.stringify(previo) === JSON.stringify(datos)) return;
    await this.alumnos.guardarHistorial(matricula, datos);
    await this.bitacora.registrar({
      autor,
      accion: 'recalcular_historial',
      entidad: `historial:${matricula}`,
      valorAnterior: previo,
    });
  }

  /**
   * RF-005 (Fig. 7, UC06): coordinación cierra el periodo. En una transacción: periodo cerrado, D-16, cargas
   * cerradas (Fig. 6) e historial recalculado de cada alumno. Si algo falla, nada cambia.
   */
  async cerrarPeriodo(autor: string, clave: string) {
    return this.prisma.transaccion(async () => {
      const periodo = await this.oferta.cerrarPeriodo(autor, clave);
      const cargas = await this.inscripciones.confirmadasDelPeriodo(clave);
      const { grupos, calificaciones } = await this.calificaciones.delPeriodo(clave);
      const pendientes = pendientesDeCierre(
        grupos.map((g) => ({
          grupoClave: g.clave,
          materiaNombre: g.materiaNombre,
          parcialesPorFolio: new Map(
            cargas
              .filter((c) => c.grupos.some((x) => Number(x.grupoId) === g.id))
              .map((c) => [
                c.folio,
                calificaciones.filter((k) => k.folio === c.folio && k.grupoId === g.id).map((k) => k.parcial),
              ]),
          ),
        })),
      );
      if (pendientes.length > 0) {
        throw new ErrorDeNegocio(
          'CIERRE_INCOMPLETO',
          `No se puede cerrar ${clave}: faltan calificaciones en ${pendientes
            .map((p) => `${p.grupo} (${p.faltan})`)
            .join(', ')}. Pide a cada profesor que complete sus parciales.`,
        );
      }
      await this.inscripciones.cerrarConfirmadas(clave);
      const matriculas = [...new Set(cargas.map((c) => c.matricula))];
      for (const matricula of matriculas) await this.recalcular(autor, matricula);
      return { ...periodo, alumnos: matriculas.length };
    });
  }

  /** D-17: corrección después del cierre, autorizada por coordinación, con el historial recalculado. */
  async corregir(autor: string, id: number, valor: number, motivo: string, evidencia: string) {
    return this.prisma.transaccion(async () => {
      const { folio } = await this.calificaciones.corregir(autor, id, valor, motivo, evidencia);
      const carga = await this.inscripciones.porFolio(folio);
      await this.recalcular(autor, carga!.matricula);
      return this.deAlumno(carga!.matricula);
    });
  }
}
