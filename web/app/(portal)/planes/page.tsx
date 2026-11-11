import { Campo, Formulario, Selector } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { crearPlan } from '@/lib/acciones';
import { consultar, sesionActual } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { fechaLegible } from '@/lib/formato';
import { puedeDarDeAlta } from '@/lib/roles';
import { AYUDA_CLAVE, CORRECCION_CLAVE, CORRECCION_FECHA } from '@/lib/textos';

export const metadata = { title: 'Planes de estudio' };

export default async function PaginaPlanes() {
  const [{ roles }, planes, facultades] = await Promise.all([
    sesionActual(),
    consultar<Esquemas['PlanRespuesta'][]>('/planes'),
    consultar<Esquemas['FacultadRespuesta'][]>('/facultades'),
  ]);
  return (
    <>
      <h1>Planes de estudio</h1>
      {puedeDarDeAlta('planes', roles) && (
        <>
          <h2>Dar de alta un plan</h2>
          <Formulario accion={crearPlan} envio="Dar de alta">
            <Campo nombre="clave" etiqueta="Clave" ayuda={AYUDA_CLAVE} correccion={CORRECCION_CLAVE} />
            <Selector
              nombre="facultadClave"
              etiqueta="Facultad"
              correccion="Elige la facultad del plan."
              opciones={facultades.map((f) => ({ valor: f.clave, etiqueta: `${f.clave} · ${f.nombre}` }))}
            />
            <Campo
              nombre="creditosTotales"
              etiqueta="Créditos totales"
              tipo="number"
              correccion="Escribe un número entero, de 1 a 10000."
            />
            <Campo nombre="vigenteDesde" etiqueta="Vigente desde" tipo="date" correccion={CORRECCION_FECHA} />
          </Formulario>
        </>
      )}
      <h2>Planes registrados</h2>
      <Tabla
        titulo="Planes de estudio registrados"
        filas={planes}
        clave={(p) => p.clave}
        columnas={[
          { titulo: 'Clave', celda: (p) => p.clave },
          { titulo: 'Facultad', celda: (p) => p.facultadClave },
          { titulo: 'Créditos totales', celda: (p) => p.creditosTotales },
          { titulo: 'Vigente desde', celda: (p) => fechaLegible(p.vigenteDesde) },
        ]}
      />
    </>
  );
}
