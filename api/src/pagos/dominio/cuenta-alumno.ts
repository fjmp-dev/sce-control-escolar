/** Fig. 3. D-10, provisional: hay adeudo vigente si el saldo es mayor que cero. */
export class CuentaAlumno {
  constructor(readonly saldo: number) {}

  tieneAdeudo(): boolean {
    return this.saldo > 0;
  }
}
