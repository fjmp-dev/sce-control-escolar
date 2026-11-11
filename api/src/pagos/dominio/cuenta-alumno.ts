/** En centavos enteros: con coma flotante, 0.1 + 0.2 rebasaría 0.3. */
const centavos = (importe: number) => Math.round(importe * 100);

/** Fig. 3. D-10, provisional: hay adeudo vigente si el saldo es mayor que cero. */
export class CuentaAlumno {
  constructor(readonly saldo: number) {}

  tieneAdeudo(): boolean {
    return this.saldo > 0;
  }

  /** Un abono, pago o beca, no deja saldo a favor (#69). */
  admiteAbono(importe: number): boolean {
    return centavos(importe) <= centavos(this.saldo);
  }
}
