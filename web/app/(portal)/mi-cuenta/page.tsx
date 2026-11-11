import { EstadoDeCuenta } from '@/componentes/cuenta';
import { Campo, Formulario } from '@/componentes/formulario';
import { iniciarPago } from '@/lib/acciones';
import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { pesos } from '@/lib/formato';

export const metadata = { title: 'Mi cuenta' };

/** RF-006, alumno: estado de cuenta y pago de su adeudo con la pasarela simulada. */
export default async function PaginaMiCuenta() {
  const cuenta = await consultar<Esquemas['EstadoDeCuentaRespuesta']>('/alumnos/actual/cuenta');
  return (
    <>
      <h1>Mi cuenta</h1>
      {cuenta.saldo > 0 && (
        <>
          <h2>Pagar</h2>
          <Formulario accion={iniciarPago} envio="Ir a pagar">
            <Campo
              nombre="importe"
              etiqueta="Importe a pagar, en pesos"
              tipo="number"
              ayuda={`Hasta ${pesos(cuenta.saldo)}. Puedes pagar una parte.`}
              correccion={`Escribe un importe mayor que cero y de hasta ${pesos(cuenta.saldo)}.`}
            />
          </Formulario>
        </>
      )}
      <EstadoDeCuenta cuenta={cuenta} enlace={(id) => `/mi-cuenta/pagos/${id}`} />
    </>
  );
}
