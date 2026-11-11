import { Injectable } from '@nestjs/common';
import { Asiento, BitacoraRepository } from './bitacora.repository';

/** CC-015: autor de lo que no tiene autor humano, como un acceso fallido. Lo crea una migración. */
export const USUARIO_TECNICO = '5ce00000-0000-4000-8000-000000000001';

/** Tabla 28: registro de operaciones sensibles con autor, acción, valor anterior y fecha. */
@Injectable()
export class BitacoraService {
  constructor(private readonly repositorio: BitacoraRepository) {}

  async registrar(asiento: Asiento): Promise<void> {
    await this.repositorio.insertar(asiento);
  }

  /** Asientos de una entidad, del más antiguo al más reciente. */
  asientos(entidad: string, accion: string) {
    return this.repositorio.deEntidad(entidad, accion);
  }

  /** El bloqueo por intentos se calcula de aquí, sin columna nueva en usuario (Tabla 15, Resistencia). */
  contarDesde(entidad: string, accion: string, desde: Date): Promise<number> {
    return this.repositorio.contar(entidad, accion, desde);
  }
}
