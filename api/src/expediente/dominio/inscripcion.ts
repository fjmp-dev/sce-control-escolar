import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

export const ESTADOS = ['borrador', 'en_validacion', 'rechazada', 'confirmada', 'ajustada', 'cerrada'] as const;
export type EstadoInscripcion = (typeof ESTADOS)[number];

/** Fig. 6: los cuatro estados de rechazo se guardan como `rechazada` con su motivo (Fig. 3). */
export const MOTIVOS = ['prerrequisito', 'adeudo', 'choque', 'cupo'] as const;
export type Motivo = (typeof MOTIVOS)[number];

/** Lo que el alumno debe hacer en cada caso (28.1: el error indica causa y corrección). */
const CORRECCION: Record<Motivo, string> = {
  prerrequisito: 'Quita esa materia de tu carga y vuelve a enviarla.',
  adeudo: 'Consulta tu estado de cuenta en caja; cuando liquides el adeudo, vuelve a enviar tu carga.',
  choque: 'Cambia uno de los dos grupos y vuelve a enviar tu carga.',
  cupo: 'Elige otro grupo de esa materia y vuelve a enviar tu carga.',
};

/** RNF-USU-001: la causa concreta y la corrección. */
export const explicarRechazo = (motivo: Motivo, causas: readonly string[]) =>
  `${causas.join('. ')}. ${CORRECCION[motivo]}`;

export interface GrupoDeLaCarga {
  id: number;
  materiaClave: string;
}

const NO_SE_PUEDE: Partial<Record<EstadoInscripcion, string>> = {
  confirmada: 'Ya tienes una inscripción confirmada en este periodo. Para cambiar tu carga, ajústala.',
  rechazada: 'Tu inscripción está rechazada: corrige tu carga y vuelve a enviarla.',
  cerrada: 'La inscripción de este periodo ya está cerrada.',
};

/** Las validaciones de la Fig. 4, en su orden fijo. */
const ORDEN: readonly Motivo[] = ['prerrequisito', 'adeudo', 'choque'];

/**
 * Fig. 3 y 6, con CC-017. Nadie confirma sin pasar las tres validaciones, en el orden de la Fig. 4 (13.1);
 * llamarlas en otro orden es un error de programación, no una regla de negocio.
 */
export class Inscripcion {
  /** Motivo del último rechazo de esta operación. En un ajuste no queda en la base: la carga confirmada se conserva. */
  ultimoRechazo: Motivo | null = null;
  private validadas = 0;
  private cargaConfirmada: readonly number[] = [];

  constructor(
    readonly folio: string,
    public estado: EstadoInscripcion,
    public motivo: Motivo | null,
    public grupos: readonly number[],
  ) {}

  static nueva(folio: string) {
    return new Inscripcion(folio, 'borrador', null, []);
  }

  /** Borrador → EnValidacion. Una inscripción rechazada se corrige: vuelve a Borrador con la carga nueva. */
  enviar(carga: readonly GrupoDeLaCarga[]): void {
    if (this.estado === 'rechazada') this.cambiarA('borrador');
    if (this.estado !== 'borrador') this.noSePuede();
    this.grupos = cargaValida(carga);
    this.cambiarA('en_validacion');
  }

  /** Confirmada → Ajustada: alta o baja de grupos. El plazo (D-6) lo revisa quien conoce el periodo. */
  ajustar(carga: readonly GrupoDeLaCarga[]): void {
    if (this.estado !== 'confirmada') this.noSePuede();
    const nueva = cargaValida(carga);
    if (nueva.join() === this.grupos.join()) {
      throw new ErrorDeNegocio('SIN_CAMBIO', 'Tu carga ya tiene esos grupos. Cambia al menos uno.');
    }
    this.cargaConfirmada = this.grupos;
    this.grupos = nueva;
    this.cambiarA('ajustada');
  }

  validarPrerrequisitos(faltantes: readonly unknown[]): boolean {
    return this.validar('prerrequisito', faltantes.length === 0);
  }

  validarAdeudos(tieneAdeudo: boolean): boolean {
    return this.validar('adeudo', !tieneAdeudo);
  }

  validarChoques(choques: readonly unknown[]): boolean {
    return this.validar('choque', choques.length === 0);
  }

  /** EnValidacion o Ajustada → Confirmada; en un ajuste es "revalidar". */
  confirmar(): void {
    if (this.validadas !== ORDEN.length) {
      throw new Error('13.1: ninguna inscripción se confirma sin validar prerrequisitos, adeudos y choques');
    }
    this.cambiarA('confirmada');
  }

  /**
   * EnValidacion → Rechazada con su motivo. La Fig. 6 no da a Ajustada otra salida que Confirmada:
   * un ajuste que no pasa se descarta y la inscripción conserva la carga que tenía.
   */
  rechazar(motivo: Motivo): void {
    this.exigirValidacion();
    this.ultimoRechazo = motivo;
    if (this.estado === 'ajustada') {
      this.grupos = this.cargaConfirmada;
      this.cambiarA('confirmada');
    } else {
      this.cambiarA('rechazada');
      this.motivo = motivo;
    }
  }

  /** Confirmada → Cerrada, con el cierre del periodo (Batch 8). */
  cerrar(): void {
    if (this.estado !== 'confirmada') this.noSePuede();
    this.cambiarA('cerrada');
  }

  private validar(motivo: Motivo, cumple: boolean): boolean {
    this.exigirValidacion();
    if (ORDEN[this.validadas] !== motivo) {
      throw new Error('Fig. 4: las validaciones van en orden fijo: prerrequisitos, adeudos y choques');
    }
    if (cumple) this.validadas += 1;
    else this.rechazar(motivo);
    return cumple;
  }

  private exigirValidacion() {
    if (this.estado !== 'en_validacion' && this.estado !== 'ajustada') {
      throw new Error(`Fig. 6: una inscripción ${this.estado} no está en validación`);
    }
  }

  private cambiarA(estado: EstadoInscripcion) {
    this.estado = estado;
    this.motivo = null;
    this.validadas = 0;
  }

  private noSePuede(): never {
    throw new ErrorDeNegocio(
      'TRANSICION_INVALIDA',
      NO_SE_PUEDE[this.estado] ?? `Una inscripción ${this.estado} no admite ese cambio.`,
    );
  }
}

/** Fig. 3: la carga tiene uno o más grupos, sin dos de la misma materia. Se guarda ordenada. */
function cargaValida(carga: readonly GrupoDeLaCarga[]): number[] {
  if (carga.length === 0) {
    throw new ErrorDeNegocio('CARGA_VACIA', 'Elige al menos un grupo para tu carga.');
  }
  const materias = carga.map((g) => g.materiaClave);
  const repetida = materias.find((m, i) => materias.indexOf(m) !== i);
  if (repetida) {
    throw new ErrorDeNegocio('MATERIA_REPETIDA', `Elegiste dos grupos de ${repetida}. Deja solo uno.`);
  }
  return carga.map((g) => g.id).sort((a, b) => a - b);
}
