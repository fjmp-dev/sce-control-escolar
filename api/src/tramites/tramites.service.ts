import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BitacoraService } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { ExpedienteService } from '../expediente/expediente.service';
import { HistorialService } from '../expediente/historial.service';
import { PagosService } from '../pagos/pagos.service';
import { PrismaService } from '../persistencia/prisma.service';
import { EstadoTramite, huella, redactar, TipoTramite, Tramite } from './dominio/tramite';
import { TramitesRepository } from './tramites.repository';

type Fila = NonNullable<Awaited<ReturnType<TramitesRepository['bloquear']>>>;
type Documento = NonNullable<Awaited<ReturnType<TramitesRepository['documento']>>>;

const vista = ({ documento, ...t }: Fila) => ({ ...t, documentoFolio: documento?.folio ?? null });

/**
 * RF-007 y RF-010 (Fig. 6): el alumno solicita; control escolar toma, emite o rechaza con motivo; el documento queda
 * Entregado cuando el alumno lo descarga. El contenido emitido no cambia y su hash lo verifica. Cada paso, con bitácora.
 */
@Injectable()
export class TramitesService {
  constructor(
    private readonly tramites: TramitesRepository,
    private readonly expedientes: ExpedienteService,
    private readonly historial: HistorialService,
    private readonly pagos: PagosService,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  async solicitar(usuarioId: string, tipo: TipoTramite) {
    const { matricula } = await this.expedientes.delUsuario(usuarioId);
    return this.prisma.transaccion(async () => {
      const folio = `TRA-${matricula}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const creado = await this.tramites.crear({ folio, matricula, tipo });
      await this.bitacora.registrar({ autor: usuarioId, accion: 'solicitar_tramite', entidad: `tramite:${folio}` });
      return vista(creado);
    });
  }

  async delUsuario(usuarioId: string) {
    const { matricula } = await this.expedientes.delUsuario(usuarioId);
    return (await this.tramites.deAlumno(matricula)).map(vista);
  }

  async cola(estado?: EstadoTramite) {
    return (await this.tramites.cola(estado)).map(vista);
  }

  tomar(autor: string, folio: string) {
    return this.cambiar(autor, folio, 'tomar_tramite', (t) => t.tomar());
  }

  rechazar(autor: string, folio: string, motivo: string) {
    return this.cambiar(autor, folio, 'rechazar_tramite', (t) => t.rechazar(motivo));
  }

  /** Lista: se redacta el documento con los datos de hoy, se guarda y se firma. No hay constancia sin historial. */
  emitir(autor: string, folio: string) {
    return this.cambiar(autor, folio, 'emitir_documento', async (t, fila) => {
      t.emitir();
      const expediente = await this.expedientes.consultar(fila.matricula);
      const { materias } = await this.historial.deAlumno(fila.matricula);
      const cerradas = materias.filter((m) => m.estadoPeriodo === 'cerrado' && m.final !== null);
      const { saldo } = await this.pagos.estadoDeCuenta(fila.matricula);
      if (fila.tipo === 'historial' && cerradas.length === 0) {
        throw new ErrorDeNegocio(
          'SIN_HISTORIAL',
          'El alumno no tiene materias de periodos cerrados: no hay historial que emitir. Recházalo con ese motivo.',
        );
      }
      if (fila.tipo === 'no_adeudo' && saldo > 0) {
        throw new ErrorDeNegocio(
          'CON_ADEUDO',
          `El alumno tiene un adeudo de ${saldo.toFixed(2)}: no procede el no adeudo. Recházalo con ese motivo.`,
        );
      }
      const documento = `DOC-${fila.folio.slice(4)}`;
      const contenido = redactar(fila.tipo as TipoTramite, {
        folio: documento,
        matricula: fila.matricula,
        nombre: expediente.nombre,
        facultad: expediente.facultadNombre,
        estatus: expediente.estatus,
        promedio: expediente.historial.promedio,
        creditos: expediente.historial.creditosAcumulados,
        avance: expediente.historial.avance,
        saldo,
        materias: cerradas.map((m) => ({
          periodo: m.periodoClave,
          clave: m.materiaClave,
          nombre: m.materiaNombre,
          creditos: m.creditos,
          final: m.final as number,
          acreditada: Boolean(m.acreditada),
        })),
        emitidoEl: new Date(),
      });
      await this.tramites.crearDocumento({
        folio: documento,
        tramiteFolio: fila.folio,
        tipo: fila.tipo,
        contenido,
        hash: huella(contenido),
      });
    });
  }

  /** La primera descarga del solicitante lo deja Entregado (Fig. 6). Un trámite ajeno no existe para él. */
  async descargar(usuarioId: string, folio: string) {
    const { matricula } = await this.expedientes.delUsuario(usuarioId);
    return this.prisma.transaccion(async () => {
      const fila = await this.tramites.bloquear(folio);
      if (!fila || fila.matricula !== matricula) throw new NotFoundException();
      const tramite = new Tramite(fila.estado as EstadoTramite, fila.motivoRechazo);
      if (tramite.entregar()) {
        await this.tramites.actualizar(folio, tramite.estado, null);
        await this.bitacora.registrar({
          autor: usuarioId,
          accion: 'entregar_documento',
          entidad: `tramite:${folio}`,
          valorAnterior: { estado: fila.estado },
        });
      }
      const documento = (await this.tramites.documentoDeTramite(folio))!;
      return this.vistaDeDocumento(documento);
    });
  }

  /** Control escolar verifica un folio: el hash del contenido guardado debe coincidir con el emitido. */
  async verificar(folio: string) {
    const documento = await this.tramites.documento(folio);
    if (!documento) throw new NotFoundException();
    return {
      ...this.vistaDeDocumento(documento),
      matricula: documento.tramite.matricula,
      valido: huella(documento.contenido) === documento.hash,
    };
  }

  private vistaDeDocumento({ folio, tramiteFolio, tipo, contenido, hash, fechaEmision }: Documento) {
    return { folio, tramiteFolio, tipo, contenido, hash, fechaEmision };
  }

  private async cambiar(
    autor: string,
    folio: string,
    accion: string,
    paso: (tramite: Tramite, fila: Fila) => void | Promise<void>,
  ) {
    return this.prisma.transaccion(async () => {
      const fila = await this.tramites.bloquear(folio);
      if (!fila) throw new NotFoundException();
      const tramite = new Tramite(fila.estado as EstadoTramite, fila.motivoRechazo);
      await paso(tramite, fila);
      const actualizado = await this.tramites.actualizar(folio, tramite.estado, tramite.motivo);
      await this.bitacora.registrar({
        autor,
        accion,
        entidad: `tramite:${folio}`,
        valorAnterior: { estado: fila.estado },
      });
      return vista(actualizado);
    });
  }
}
