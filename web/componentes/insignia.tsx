import type { ReactNode } from 'react';

export type Tono = 'exito' | 'advertencia' | 'error' | 'informacion' | 'neutro';

/** 28.1: el tono acompaña al texto, nunca lo sustituye. */
export function Insignia({ tono = 'neutro', children }: { tono?: Tono; children: ReactNode }) {
  return <span className={`insignia insignia-${tono}`}>{children}</span>;
}

/**
 * Tono de cada estado de lib/formato.ts (ETIQUETA_ESTADO_INSCRIPCION, _TRAMITE, _PAGO, _PERIODO y ETIQUETA_ESTATUS)
 * y de una cuenta activa o inactiva. test/componentes.test.tsx revisa que no falte ninguno.
 */
export const TONO_DE_ESTADO: Record<string, Tono> = {
  // Inscripción
  borrador: 'neutro',
  en_validacion: 'informacion',
  rechazada: 'error',
  confirmada: 'exito',
  ajustada: 'exito',
  cerrada: 'neutro',
  // Trámite (rechazada ya está arriba)
  recibida: 'informacion',
  en_proceso: 'advertencia',
  lista: 'exito',
  entregada: 'neutro',
  // Pago
  pendiente: 'advertencia',
  aplicado: 'exito',
  rechazado: 'error',
  cancelado: 'neutro',
  // Periodo
  abierto: 'exito',
  en_curso: 'informacion',
  cerrado: 'neutro',
  // Estatus del alumno y cuentas de usuario
  activo: 'exito',
  baja: 'error',
  egresado: 'informacion',
  inactivo: 'neutro',
};

export const tonoDeEstado = (estado: string): Tono =>
  Object.hasOwn(TONO_DE_ESTADO, estado) ? TONO_DE_ESTADO[estado] : 'neutro';
