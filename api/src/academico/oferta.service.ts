import { Injectable } from '@nestjs/common';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { aCentesimas, materiasAcreditadas } from './dominio/calificacion';
import { choquesEntre, Grupo, Horario } from './dominio/oferta';
import { faltantes } from './dominio/prerequisito';
import { FilaDeGrupo, OfertaRepository } from './oferta.repository';

const hora = (valor: Date) => valor.toISOString().slice(11, 16);

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
 * Dominio académico en la Fig. 4: valida prerrequisitos y choques, y reserva el cupo dentro de la transacción
 * de la inscripción. La oferta mínima del Batch 5 solo se consulta; su alta es del Batch 7 (RF-003).
 */
@Injectable()
export class OfertaService {
  constructor(private readonly oferta: OfertaRepository) {}

  async delPeriodo(periodoClave: string) {
    return (await this.oferta.grupos({ periodoClave })).map(aGrupo);
  }

  async grupos(ids: readonly number[]) {
    return (await this.oferta.grupos({ id: { in: ids.map(BigInt) } })).map(aGrupo);
  }

  /** D-6, provisional: se inscribe y se ajusta mientras el periodo está abierto. */
  async periodoAbierto(clave: string): Promise<void> {
    if ((await this.oferta.periodo(clave))?.estado !== 'abierto') {
      throw new ErrorDeNegocio('PERIODO_NO_ABIERTO', `La inscripción del periodo ${clave} no está abierta.`);
    }
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
