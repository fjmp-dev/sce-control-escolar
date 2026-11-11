import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BitacoraService, USUARIO_TECNICO } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { PrismaService } from '../persistencia/prisma.service';
import { CuentaRepository } from './cuenta.repository';
import { CuentaAlumno } from './dominio/cuenta-alumno';
import { EstadoPago, Pago } from './dominio/pago';

type FilaDePago = NonNullable<Awaited<ReturnType<CuentaRepository['pago']>>>;

const vista = ({ id, matricula, referencia, importe, estado, fecha, movimiento }: FilaDePago) => ({
  id: Number(id),
  matricula,
  referencia,
  importe: Number(importe),
  estado,
  fecha,
  aplicadoEn: movimiento?.fecha ?? null,
});

/** Un día del calendario de la Ciudad de México (UTC-6, sin horario de verano desde 2022). */
const diaLocal = (fecha: string) => {
  const desde = new Date(`${fecha}T06:00:00Z`);
  return { desde, hasta: new Date(desde.getTime() + 86_400_000) };
};

/**
 * RF-006 con pasarela simulada (decisión de FJMP del 10 de noviembre de 2026: sin Mercado Pago). Caja genera cargos y
 * becas; el alumno paga y el pago se refleja una sola vez; caja hace el corte del día. Todo cambio de saldo, en
 * transacción y con bitácora.
 */
@Injectable()
export class PagosService {
  constructor(
    private readonly cuentas: CuentaRepository,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Fig. 4: consultar `cuenta_alumno`. Todo expediente nace con su cuenta; si falta, es un defecto de datos y no
   * se supone "sin adeudo" (AMFE de inscripción, modo 8).
   */
  async validarAdeudos(matricula: string): Promise<{ tieneAdeudo: boolean }> {
    const cuenta = await this.cuentas.porMatricula(matricula);
    if (!cuenta) throw new Error(`El expediente ${matricula} no tiene cuenta_alumno`);
    return { tieneAdeudo: new CuentaAlumno(Number(cuenta.saldo)).tieneAdeudo() };
  }

  async estadoDeCuenta(matricula: string) {
    const cuenta = await this.cuentas.estado(matricula);
    if (!cuenta) throw new NotFoundException();
    return {
      matricula,
      saldo: Number(cuenta.saldo),
      movimientos: cuenta.movimientos.map((m) => ({ ...m, id: Number(m.id), importe: Number(m.importe) })),
      pagos: cuenta.alumno.pagos.map(vista),
    };
  }

  /** Fig. 7, "Generar cargos del periodo": una vez por alumno y concepto, aunque caja lo repita (D-7). En transacción. */
  async generarCargo(autor: string, matricula: string, concepto: string, importe: number): Promise<boolean> {
    await this.cuentas.bloquear(matricula);
    if ((await this.cuentas.tieneCargo(matricula, concepto)) > 0) return false;
    const { saldo } = (await this.cuentas.porMatricula(matricula))!;
    await this.cuentas.movimiento({ matricula, concepto, importe, tipo: 'cargo' });
    await this.bitacora.registrar({
      autor,
      accion: 'cargo',
      entidad: `cuenta:${matricula}`,
      valorAnterior: { saldo: Number(saldo) },
    });
    return true;
  }

  /** Beca de caja: abono que no deja el saldo a favor. */
  async registrarBeca(autor: string, matricula: string, concepto: string, importe: number) {
    return this.prisma.transaccion(async () => {
      const cuenta = await this.cuentas.porMatricula(matricula);
      if (!cuenta) throw new NotFoundException();
      await this.cuentas.bloquear(matricula);
      const { saldo } = (await this.cuentas.porMatricula(matricula))!;
      if (!new CuentaAlumno(Number(saldo)).admiteAbono(importe)) {
        throw new ErrorDeNegocio(
          'IMPORTE_MAYOR_AL_SALDO',
          `La beca rebasa el saldo de ${Number(saldo).toFixed(2)}. Reduce el importe.`,
        );
      }
      await this.cuentas.movimiento({ matricula, concepto, importe, tipo: 'beca' });
      await this.bitacora.registrar({
        autor,
        accion: 'beca',
        entidad: `cuenta:${matricula}`,
        valorAnterior: { saldo: Number(saldo) },
      });
      return this.estadoDeCuenta(matricula);
    });
  }

  /** El alumno inicia un pago por un importe de su adeudo. */
  async iniciarPago(matricula: string, importe: number) {
    const cuenta = await this.cuentas.porMatricula(matricula);
    if (!cuenta) throw new NotFoundException();
    const saldo = Number(cuenta.saldo);
    if (saldo <= 0) throw new ErrorDeNegocio('SIN_ADEUDO', 'No tienes adeudo: no hay nada que pagar.');
    if (!new CuentaAlumno(saldo).admiteAbono(importe)) {
      throw new ErrorDeNegocio(
        'IMPORTE_MAYOR_AL_SALDO',
        `El importe rebasa tu saldo de ${saldo.toFixed(2)}. Reduce el importe.`,
      );
    }
    const claveIdempotencia = randomUUID();
    const referencia = `REF-${claveIdempotencia.slice(0, 8).toUpperCase()}`;
    return vista(await this.cuentas.crearPago({ matricula, claveIdempotencia, referencia, importe }));
  }

  /**
   * Pasarela simulada: aprueba o rechaza el pago. Puede llegar varias veces; el pago se aplica una sola vez, con un
   * movimiento, el saldo y la bitácora en la misma transacción (Fig. 5, R-14). El importe se compara con el saldo
   * vigente, con la cuenta bloqueada: dos intentos por el mismo adeudo no dejan saldo a favor (#69, CI-PAG-01).
   */
  async simular(matricula: string, id: number, resultado: 'aprobado' | 'rechazado') {
    const salida = await this.prisma.transaccion(async () => {
      await this.cuentas.bloquearPago(id);
      const fila = await this.cuentas.pago(id);
      if (!fila || fila.matricula !== matricula) throw new NotFoundException(); // un pago ajeno no existe para quien pregunta
      const pago = new Pago(fila.estado as EstadoPago);
      if (resultado === 'rechazado') {
        pago.rechazar();
        if (pago.estado === fila.estado) return vista(fila); // aviso repetido: ya estaba rechazado
        const rechazado = await this.cuentas.cambiarEstado(fila.id, pago.estado);
        // R-21: el rechazo de la pasarela también deja asiento, firmado por el usuario técnico (CC-015).
        await this.bitacora.registrar({
          autor: USUARIO_TECNICO,
          accion: 'pago_rechazado',
          entidad: `pago:${id}`,
          valorAnterior: { estado: fila.estado },
        });
        return vista(rechazado);
      }
      // Primero el pago y luego la cuenta: ningún otro camino bloquea en orden inverso, y así no hay interbloqueo.
      await this.cuentas.bloquear(matricula);
      const saldo = Number((await this.cuentas.porMatricula(matricula))!.saldo);
      const importe = Number(fila.importe);
      // La aplicación y el rechazo los dispara la pasarela, no una persona: firma el usuario técnico (CC-015).
      if (!pago.aprobar(new CuentaAlumno(saldo).admiteAbono(importe))) {
        if (pago.estado !== 'rechazado') return vista(fila); // ya estaba aplicado
        await this.cuentas.cambiarEstado(fila.id, pago.estado);
        await this.bitacora.registrar({
          autor: USUARIO_TECNICO,
          accion: 'pago_rechazado',
          entidad: `pago:${id}`,
          valorAnterior: { estado: fila.estado, saldo },
        });
        return new ErrorDeNegocio(
          'PAGO_NO_APLICABLE',
          `El pago ${fila.referencia} por ${importe.toFixed(2)} rebasa tu saldo vigente de ${saldo.toFixed(2)}: ` +
            'otro pago o una beca lo redujo. Se rechazó y no se cobró. Revisa tu estado de cuenta y, si queda ' +
            'adeudo, inicia otro pago por el saldo vigente.',
        );
      }
      await this.cuentas.movimiento({
        matricula,
        concepto: `Pago en línea ${fila.referencia}`,
        importe,
        tipo: 'abono',
        pagoId: fila.id,
      });
      const aplicado = await this.cuentas.cambiarEstado(fila.id, pago.estado);
      await this.bitacora.registrar({
        autor: USUARIO_TECNICO,
        accion: 'pago_aplicado',
        entidad: `pago:${id}`,
        valorAnterior: { saldo },
      });
      return vista(aplicado);
    });
    // Se lanza después del COMMIT: dentro de la transacción revertiría el rechazo y su bitácora (como CC-013).
    if (salida instanceof ErrorDeNegocio) throw salida;
    return salida;
  }

  /** Recibo: solo de un pago aplicado. `matricula` limita al dueño; caja lo omite. */
  async recibo(id: number, matricula?: string) {
    const fila = await this.cuentas.pago(id);
    if (!fila || (matricula && fila.matricula !== matricula)) throw new NotFoundException();
    if (fila.estado !== 'aplicado') {
      throw new ErrorDeNegocio('PAGO_NO_APLICADO', `El pago ${fila.referencia} está ${fila.estado}: no tiene recibo.`);
    }
    return vista(fila);
  }

  /** Corte de caja del día: pagos aplicados ese día y su total. */
  async corte(fecha: string) {
    const { desde, hasta } = diaLocal(fecha);
    const pagos = (await this.cuentas.aplicadosEntre(desde, hasta)).map(vista);
    return { fecha, pagos, total: Math.round(pagos.reduce((s, p) => s + p.importe * 100, 0)) / 100 };
  }
}
