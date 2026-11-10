import { Campo, Formulario } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { abrirPeriodo } from '@/lib/acciones';
import { consultar, sesionActual } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTADO_PERIODO, fechaLegible, momentoLegible } from '@/lib/formato';
import { puedeDarDeAlta } from '@/lib/roles';
import { CORRECCION_FECHA } from '@/lib/textos';

export const metadata = { title: 'Periodos' };

export default async function PaginaPeriodos() {
  const [{ roles }, periodos] = await Promise.all([
    sesionActual(),
    consultar<Esquemas['PeriodoRespuesta'][]>('/periodos'),
  ]);
  return (
    <>
      <h1>Periodos</h1>
      {puedeDarDeAlta('periodos', roles) && (
        <>
          <h2>Abrir un periodo</h2>
          <p>
            El periodo se abre sin oferta. Después define sus grupos y publica la oferta en la página Oferta; hasta
            entonces los alumnos no la ven.
          </p>
          <Formulario accion={abrirPeriodo} envio="Abrir periodo">
            <Campo
              nombre="clave"
              etiqueta="Clave"
              ayuda="Año de cuatro dígitos y la letra A o B. Ejemplo: 2027A."
              correccion="Usa el año y la letra A o B, como 2027A."
            />
            <Campo nombre="fechaInicio" etiqueta="Fecha de inicio" tipo="date" correccion={CORRECCION_FECHA} />
            <Campo
              nombre="fechaFin"
              etiqueta="Fecha de fin"
              tipo="date"
              ayuda="Debe ser posterior a la fecha de inicio."
              correccion={CORRECCION_FECHA}
            />
          </Formulario>
        </>
      )}
      <h2>Periodos registrados</h2>
      <Tabla
        titulo="Periodos registrados"
        filas={periodos}
        clave={(p) => p.clave}
        columnas={[
          { titulo: 'Clave', celda: (p) => p.clave },
          { titulo: 'Inicio', celda: (p) => fechaLegible(p.fechaInicio) },
          { titulo: 'Fin', celda: (p) => fechaLegible(p.fechaFin) },
          { titulo: 'Estado', celda: (p) => ETIQUETA_ESTADO_PERIODO[p.estado] ?? p.estado },
          {
            titulo: 'Oferta',
            celda: (p) =>
              p.ofertaPublicadaEn ? `Publicada el ${momentoLegible(p.ofertaPublicadaEn)}` : 'Sin publicar',
          },
        ]}
      />
    </>
  );
}
