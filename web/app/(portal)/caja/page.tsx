import { Aviso } from '@/componentes/aviso';
import { EstadoDeCuenta } from '@/componentes/cuenta';
import { Campo, Formulario, Selector } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { generarCargos, registrarBeca } from '@/lib/acciones';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PERIODO, hoyEnMexico, momentoLegible, pesos } from '@/lib/formato';

export const metadata = { title: 'Caja' };

type Cuenta = Esquemas['EstadoDeCuentaRespuesta'];

async function cuentaDe(matricula: string): Promise<Cuenta | string> {
  try {
    return await consultar<Cuenta>(`/alumnos/${encodeURIComponent(matricula)}/cuenta`);
  } catch (error) {
    if (error instanceof ErrorApi && (error.estado === 404 || error.estado === 400)) {
      return `No hay un expediente con la matrícula ${matricula}. Revisa los dígitos.`;
    }
    throw error;
  }
}

/** RF-006, caja: estado de cuenta por matrícula, becas, cargos del periodo (Fig. 7) y corte del día. */
export default async function PaginaCaja({
  searchParams,
}: Readonly<{ searchParams: Promise<{ matricula?: string; fecha?: string }> }>) {
  const parametros = await searchParams;
  const matricula = (parametros.matricula ?? '').trim();
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(parametros.fecha ?? '') ? (parametros.fecha as string) : hoyEnMexico();
  const [cuenta, periodos, corte] = await Promise.all([
    matricula ? cuentaDe(matricula) : undefined,
    consultar<Esquemas['PeriodoRespuesta'][]>('/periodos'),
    consultar<Esquemas['CorteRespuesta']>(`/pagos?fecha=${fecha}`),
  ]);
  return (
    <>
      <h1>Caja</h1>
      <h2>Estado de cuenta</h2>
      <form method="get" className="busqueda" role="search">
        <label htmlFor="matricula">Matrícula del alumno</label>
        <input
          id="matricula"
          name="matricula"
          type="search"
          inputMode="numeric"
          defaultValue={matricula}
          maxLength={10}
        />
        <input type="hidden" name="fecha" value={fecha} />
        <button type="submit" className="boton">
          Buscar
        </button>
      </form>
      {typeof cuenta === 'string' && <Aviso tipo="error">{cuenta}</Aviso>}
      {typeof cuenta === 'object' && (
        <>
          <EstadoDeCuenta cuenta={cuenta} />
          {cuenta.saldo > 0 && (
            <>
              <h2>Registrar una beca</h2>
              <Formulario accion={registrarBeca} envio="Registrar la beca">
                <input type="hidden" name="matricula" value={cuenta.matricula} />
                <Campo nombre="concepto" etiqueta="Concepto" correccion="Escribe el concepto, hasta 120 caracteres." />
                <Campo
                  nombre="importe"
                  etiqueta="Importe, en pesos"
                  tipo="number"
                  ayuda={`Hasta ${pesos(cuenta.saldo)}: la beca no deja saldo a favor.`}
                  correccion={`Escribe un importe mayor que cero y de hasta ${pesos(cuenta.saldo)}.`}
                />
              </Formulario>
            </>
          )}
        </>
      )}

      <h2>Cargos del periodo</h2>
      <p>Se cargan a cada alumno con inscripción confirmada. Repetirlo no duplica el cargo de un mismo concepto.</p>
      <Formulario accion={generarCargos} envio="Generar los cargos">
        <Selector
          nombre="periodoClave"
          etiqueta="Periodo"
          correccion="Elige el periodo."
          opciones={periodos.map((p) => ({
            valor: p.clave,
            etiqueta: `${p.clave} (${ETIQUETA_ESTADO_PERIODO[p.estado] ?? p.estado})`,
          }))}
        />
        <Campo
          nombre="concepto"
          etiqueta="Concepto"
          ayuda="Por ejemplo, Inscripción 2027A."
          correccion="Escribe el concepto, hasta 120 caracteres."
        />
        <Campo
          nombre="importe"
          etiqueta="Importe por alumno, en pesos"
          tipo="number"
          correccion="Escribe un importe mayor que cero."
        />
      </Formulario>

      <h2>Corte del día</h2>
      <form method="get" className="busqueda">
        <label htmlFor="fecha">Día</label>
        <input id="fecha" name="fecha" type="date" defaultValue={fecha} />
        <input type="hidden" name="matricula" value={matricula} />
        <button type="submit" className="boton">
          Consultar
        </button>
      </form>
      <Tabla
        titulo={`Pagos aplicados el ${fecha}`}
        filas={corte.pagos}
        clave={(p) => String(p.id)}
        columnas={[
          { titulo: 'Referencia', celda: (p) => p.referencia },
          { titulo: 'Matrícula', celda: (p) => p.matricula },
          { titulo: 'Hora', celda: (p) => momentoLegible(p.aplicadoEn ?? p.fecha) },
          { titulo: 'Importe', celda: (p) => pesos(p.importe) },
        ]}
      />
      <p className="saldo">Total del día: {pesos(corte.total)}</p>
    </>
  );
}
