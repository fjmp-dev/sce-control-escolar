import { createHash } from 'node:crypto';
import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

export const TIPOS = ['constancia', 'no_adeudo', 'historial'] as const;
export type TipoTramite = (typeof TIPOS)[number];
export type EstadoTramite = 'recibida' | 'en_proceso' | 'lista' | 'entregada' | 'rechazada';

/** Fig. 6: Recibida → EnProceso → Rechazada (con motivo) o Lista → Entregada cuando el solicitante descarga. */
export class Tramite {
  constructor(
    public estado: EstadoTramite,
    public motivo: string | null = null,
  ) {}

  tomar(): void {
    this.pasar('recibida', 'en_proceso');
  }

  emitir(): void {
    this.pasar('en_proceso', 'lista');
  }

  rechazar(motivo: string): void {
    this.pasar('en_proceso', 'rechazada');
    this.motivo = motivo;
  }

  /** Devuelve si es la primera descarga; las siguientes no cambian nada. */
  entregar(): boolean {
    if (this.estado === 'entregada') return false;
    this.pasar('lista', 'entregada');
    return true;
  }

  private pasar(desde: EstadoTramite, hacia: EstadoTramite) {
    if (this.estado !== desde) {
      throw new ErrorDeNegocio(
        'TRAMITE_TRANSICION_INVALIDA',
        `El trámite está ${this.estado.replace('_', ' ')}: no puede pasar a ${hacia.replace('_', ' ')}.`,
      );
    }
    this.estado = hacia;
  }
}

/** El hash del documento emitido: si el contenido cambia, ya no coincide. */
export const huella = (contenido: string) => createHash('sha256').update(contenido, 'utf8').digest('hex');

export interface DatosDelDocumento {
  folio: string;
  matricula: string;
  nombre: string;
  facultad: string;
  estatus: string;
  promedio: number;
  creditos: number;
  avance: number;
  saldo: number;
  materias: { periodo: string; clave: string; nombre: string; creditos: number; final: number; acreditada: boolean }[];
  emitidoEl: Date;
}

const FECHA = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeZone: 'America/Mexico_City' });

/** El texto del documento: lo que se emite, se guarda tal cual y se firma con su hash. */
export function redactar(tipo: TipoTramite, d: DatosDelDocumento): string {
  const encabezado = [
    'Sistema de Control Escolar',
    tipo === 'constancia'
      ? 'CONSTANCIA DE ESTUDIOS'
      : tipo === 'no_adeudo'
        ? 'CONSTANCIA DE NO ADEUDO'
        : 'HISTORIAL ACADÉMICO',
    `Folio: ${d.folio}`,
    '',
  ];
  const cuerpo =
    tipo === 'constancia'
      ? [
          `Se hace constar que ${d.nombre}, con matrícula ${d.matricula}, es alumno de ${d.facultad} con estatus ${d.estatus}.`,
          `Promedio general: ${d.promedio.toFixed(2)}. Créditos acumulados: ${d.creditos}. Avance de carrera: ${d.avance.toFixed(2)} %.`,
        ]
      : tipo === 'no_adeudo'
        ? [`Se hace constar que ${d.nombre}, con matrícula ${d.matricula}, no tiene adeudos con la institución.`]
        : [
            `Alumno: ${d.nombre}. Matrícula: ${d.matricula}. ${d.facultad}.`,
            '',
            'Periodo | Materia | Créditos | Final | Resultado',
            ...d.materias.map(
              (m) =>
                `${m.periodo} | ${m.clave} ${m.nombre} | ${m.creditos} | ${m.final.toFixed(2)} | ${m.acreditada ? 'Acreditada' : 'No acreditada'}`,
            ),
            '',
            `Promedio general: ${d.promedio.toFixed(2)}. Créditos acumulados: ${d.creditos}. Avance de carrera: ${d.avance.toFixed(2)} %.`,
          ];
  return [...encabezado, ...cuerpo, '', `Emitido el ${FECHA.format(d.emitidoEl)}.`].join('\n');
}
