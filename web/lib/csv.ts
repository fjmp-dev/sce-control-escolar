import type { Esquemas } from './contrato';

type Calificaciones = Esquemas['CalificacionesDelAlumnoRespuesta'];

const celda = (valor: string | number | boolean | null) => `"${String(valor ?? '').replaceAll('"', '""')}"`;

/**
 * Tabla 16, Portabilidad: el historial en formato tabular para intercambio institucional. Solo materias de periodos
 * cerrados, que son las que tienen final (D-5). Con BOM, para que una hoja de cálculo lea bien los acentos.
 */
export function historialCsv({ matricula, historial, materias }: Calificaciones): string {
  const filas = [
    [
      'matricula',
      'periodo',
      'materia_clave',
      'materia',
      'grupo',
      'creditos',
      'final',
      'acreditada',
      'cuenta_para_promedio',
    ],
    ...materias
      .filter((m) => m.estadoPeriodo === 'cerrado')
      .map((m) => [
        matricula,
        m.periodoClave,
        m.materiaClave,
        m.materiaNombre,
        m.grupoClave,
        m.creditos,
        m.final === null ? '' : m.final.toFixed(2),
        m.acreditada ? 'si' : 'no',
        m.vigente ? 'si' : 'no',
      ]),
    [],
    ['promedio', historial.promedio.toFixed(2)],
    ['creditos_acumulados', historial.creditosAcumulados],
    ['avance_porcentaje', historial.avance.toFixed(2)],
  ];
  return `﻿${filas.map((fila) => fila.map(celda).join(',')).join('\r\n')}\r\n`;
}

export const respuestaCsv = (contenido: string, nombre: string) =>
  new Response(contenido, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nombre}"`,
      'Cache-Control': 'no-store',
    },
  });
