import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

export type EstadoPago = 'pendiente' | 'aplicado' | 'rechazado' | 'cancelado';

/**
 * Fig. 3, `Pago.aplicarUnaVez()` (RF-006, RK-02). La pasarela es simulada: puede avisar más de una vez del mismo pago,
 * y el pago se refleja una sola vez. Un pago rechazado nunca se aplica.
 */
export class Pago {
  constructor(public estado: EstadoPago) {}

  /** Devuelve si hay que aplicarlo ahora; si ya estaba aplicado, no hace nada. */
  aplicarUnaVez(): boolean {
    if (this.estado === 'aplicado') return false;
    if (this.estado !== 'pendiente') {
      throw new ErrorDeNegocio(
        'PAGO_NO_APLICABLE',
        `Este pago está ${this.estado} y ya no se puede aplicar. Inicia otro.`,
      );
    }
    this.estado = 'aplicado';
    return true;
  }

  /**
   * La pasarela aprueba (#69). Si el importe ya no cabe en el saldo vigente, porque otro pago o una beca lo redujo,
   * el pago pendiente se rechaza: la pasarela es nuestra y no se cobra. Si cabe, se aplica una sola vez.
   */
  aprobar(cabeEnElSaldo: boolean): boolean {
    if (this.estado !== 'pendiente' || cabeEnElSaldo) return this.aplicarUnaVez();
    this.rechazar();
    return false;
  }

  rechazar(): void {
    if (this.estado === 'rechazado') return;
    if (this.estado !== 'pendiente') {
      throw new ErrorDeNegocio('PAGO_NO_APLICABLE', `Este pago ya está ${this.estado}.`);
    }
    this.estado = 'rechazado';
  }
}
