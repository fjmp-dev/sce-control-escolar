import { Injectable } from '@nestjs/common';
import { BitacoraService } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { UsuariosService } from '../identidad/usuarios.service';
import { PrismaService } from '../persistencia/prisma.service';
import { aCentesimas, materiasAcreditadas } from './dominio/calificacion';
import { choquesEntre, Grupo, Horario, validarGrupoNuevo } from './dominio/oferta';
import { EstadoPeriodo, Periodo } from './dominio/periodo';
import { faltantes } from './dominio/prerequisito';
import { FilaDeGrupo, OfertaRepository } from './oferta.repository';

export interface DefinicionDeGrupo {
  periodoClave: string;
  clave: string;
  materiaClave: string;
  /** Correo de la cuenta del profesor, como al vincular un expediente (RF-001). */
  profesor: string;
  cupo: number;
  horarios: { dia: number; horaInicio: string; horaFin: string; aula: string }[];
}

const hora = (valor: Date) => valor.toISOString().slice(11, 16);
const aHora = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`);

const aGrupo = (fila: FilaDeGrupo) =>
  new Grupo({
    id: Number(fila.id),
    clave: fila.clave,
    materiaClave: fila.materiaClave,
    materiaNombre: fila.materia.nombre,
    creditos: fila.materia.creditos,
    cupo: fila.cupo,
    ocupacion: fila.ocupacion,
    horarios: fila.horarios.map((h) => new Horario(h.dia, hora(h.horaInicio), hora(h.horaFin), h.aula)),
  });

/**
 * RF-003 (Fig. 7): coordinación define los grupos del periodo y publica la oferta; cada rol la consulta a su
 * manera (Tabla 4). En la Fig. 4 valida prerrequisitos y choques, y reserva el cupo en la transacción de la inscripción.
 */
@Injectable()
export class OfertaService {
  constructor(
    private readonly oferta: OfertaRepository,
    private readonly usuarios: UsuariosService,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  /** Alumno: solo la oferta publicada (CC-012). */
  async publicada(periodoClave: string) {
    if (!(await this.oferta.periodo(periodoClave))?.ofertaPublicadaEn) return [];
    return (await this.oferta.grupos({ periodoClave })).map(aGrupo);
  }

  /** Coordinación: toda la oferta del periodo, publicada o no, con el profesor de cada grupo. */
  async completa(periodoClave: string) {
    return this.conProfesor(await this.oferta.grupos({ periodoClave }));
  }

  /** Profesor: sus grupos de los periodos que no han cerrado (3.4, impartición). */
  async asignados(profesorId: string) {
    return (await this.oferta.grupos({ profesorId, periodo: { estado: { not: 'cerrado' } } })).map((f) => ({
      ...aGrupo(f),
      periodoClave: f.periodoClave,
    }));
  }

  async grupos(ids: readonly number[]) {
    return (await this.oferta.grupos({ id: { in: ids.map(BigInt) } })).map(aGrupo);
  }

  /** RF-003 y D-13: el grupo nace con su profesor y sus sesiones, sin traslapes de aula ni de profesor. */
  async definirGrupo(autor: string, datos: DefinicionDeGrupo) {
    const profesorId = await this.usuarios.cuentaDeProfesor(datos.profesor);
    const horarios = datos.horarios.map((h) => new Horario(h.dia, h.horaInicio, h.horaFin, h.aula));
    return this.prisma.transaccion(async () => {
      await this.oferta.bloquearPeriodo(datos.periodoClave);
      (await this.periodo(datos.periodoClave)).exigirAbierto();
      const delPeriodo = (await this.oferta.grupos({ periodoClave: datos.periodoClave })).map((f) => ({
        clave: f.clave,
        profesorId: f.profesorId,
        horarios: aGrupo(f).horarios,
      }));
      validarGrupoNuevo(datos.clave, profesorId, horarios, delPeriodo);
      const creado = await this.oferta.crearGrupo({
        clave: datos.clave,
        materiaClave: datos.materiaClave,
        periodoClave: datos.periodoClave,
        profesorId,
        cupo: datos.cupo,
        horarios: {
          create: horarios.map((h) => ({
            dia: h.dia,
            horaInicio: aHora(h.horaInicio),
            horaFin: aHora(h.horaFin),
            aula: h.aula,
          })),
        },
      });
      await this.bitacora.registrar({ autor, accion: 'alta_grupo', entidad: `grupo:${creado.id}` });
      return { ...aGrupo(creado), profesor: datos.profesor };
    });
  }

  /** Fig. 7, "Publicar oferta académica": desde ahí el alumno la consulta y se inscribe. */
  async publicarOferta(autor: string, clave: string) {
    return this.prisma.transaccion(async () => {
      await this.oferta.bloquearPeriodo(clave);
      const { ofertaPublicadaEn } = (await this.periodo(clave)).publicarOferta(new Date());
      const publicado = await this.oferta.publicar(clave, ofertaPublicadaEn as Date);
      await this.bitacora.registrar({ autor, accion: 'publicar_oferta', entidad: `periodo:${clave}` });
      return publicado;
    });
  }

  /** CC-019: termina la inscripción y empieza la ventana de captura (D-6). */
  async iniciarCurso(autor: string, clave: string) {
    return this.prisma.transaccion(async () => {
      await this.oferta.bloquearPeriodo(clave);
      const { estado } = (await this.periodo(clave)).iniciarCurso();
      const iniciado = await this.oferta.cambiarEstado(clave, estado);
      await this.bitacora.registrar({ autor, accion: 'iniciar_curso', entidad: `periodo:${clave}` });
      return iniciado;
    });
  }

  /**
   * RF-005: en curso → cerrado, con el periodo bloqueado en exclusiva: las capturas en curso terminan antes.
   * Debe llamarse en la transacción del cierre, que además valida D-16 y recalcula el historial.
   */
  async cerrarPeriodo(autor: string, clave: string) {
    await this.oferta.bloquearPeriodo(clave);
    const { estado } = (await this.periodo(clave)).cerrar();
    const cerrado = await this.oferta.cambiarEstado(clave, estado);
    await this.bitacora.registrar({ autor, accion: 'cerrar_periodo', entidad: `periodo:${clave}` });
    return cerrado;
  }

  /** D-6, provisional, y CC-012: se inscribe y se ajusta con el periodo abierto y la oferta publicada. */
  async periodoAbierto(clave: string): Promise<void> {
    (await this.periodo(clave)).exigirInscripcionAbierta();
  }

  async periodo(clave: string): Promise<Periodo> {
    const fila = await this.oferta.periodo(clave);
    if (!fila) throw new ErrorDeNegocio('PERIODO_NO_ABIERTO', `No existe el periodo ${clave}. Elige uno de la lista.`);
    return new Periodo(
      fila.clave,
      fila.fechaInicio,
      fila.fechaFin,
      fila.estado as EstadoPeriodo,
      fila.ofertaPublicadaEn,
    );
  }

  private async conProfesor(filas: FilaDeGrupo[]) {
    const correos = await this.usuarios.correos([...new Set(filas.map((f) => f.profesorId))]);
    return filas.map((f) => ({ ...aGrupo(f), profesor: correos.get(f.profesorId) ?? '' }));
  }

  /** Los grupos elegidos, que deben ser de la oferta del periodo. */
  async carga(periodoClave: string, ids: readonly number[]) {
    const grupos = (await this.oferta.grupos({ periodoClave, id: { in: ids.map(BigInt) } })).map(aGrupo);
    if (grupos.length !== new Set(ids).size) {
      throw new ErrorDeNegocio(
        'GRUPO_FUERA_DE_OFERTA',
        `Uno de los grupos no está en la oferta de ${periodoClave}. Actualiza la página y elige de nuevo.`,
      );
    }
    return grupos;
  }

  async validarPrerrequisitos(matricula: string, materias: string[]) {
    const [requisitos, calificaciones] = await Promise.all([
      this.oferta.requisitos(materias),
      this.oferta.calificacionesCerradas(matricula),
    ]);
    const acreditadas = materiasAcreditadas(
      calificaciones.map((c) => ({
        folio: c.folio,
        materiaClave: c.grupo.materiaClave,
        inicioDelPeriodo: c.periodo.fechaInicio,
        centesimas: aCentesimas(Number(c.valor)),
      })),
    );
    return faltantes(
      requisitos.map((r) => ({
        materiaClave: r.materiaClave,
        requiereClave: r.requiereClave,
        obligatorio: r.obligatorio,
        materiaNombre: r.materia.nombre,
        requiereNombre: r.requiere.nombre,
      })),
      acreditadas,
    );
  }

  validarChoques(carga: readonly Grupo[]) {
    return choquesEntre(carga);
  }

  /** Fig. 4: reservar cupo con bloqueo de la fila. Debe llamarse dentro de una transacción. */
  async reservarCupo(id: number): Promise<boolean> {
    await this.oferta.bloquear(id);
    const [grupo] = await this.grupos([id]); // leído después del bloqueo: ve la ocupación que dejó el último COMMIT
    if (!grupo.hayCupo()) return false;
    await this.oferta.ocupar(id, 1);
    return true;
  }

  /** Una baja en el ajuste libera el lugar en la misma transacción. */
  liberarCupo(id: number) {
    return this.oferta.ocupar(id, -1);
  }
}
