import { Campo, Formulario } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { crearFacultad } from '@/lib/acciones';
import { consultar, sesionActual } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { AYUDA_CLAVE, CORRECCION_CLAVE } from '@/lib/textos';
import { puedeDarDeAlta } from '@/lib/roles';

export const metadata = { title: 'Facultades' };

export default async function PaginaFacultades() {
  const [{ roles }, facultades] = await Promise.all([
    sesionActual(),
    consultar<Esquemas['FacultadRespuesta'][]>('/facultades'),
  ]);
  return (
    <>
      <h1>Facultades</h1>
      {puedeDarDeAlta('facultades', roles) && (
        <>
          <h2>Dar de alta una facultad</h2>
          <Formulario accion={crearFacultad} envio="Dar de alta">
            <Campo nombre="clave" etiqueta="Clave" ayuda={AYUDA_CLAVE} correccion={CORRECCION_CLAVE} />
            <Campo nombre="nombre" etiqueta="Nombre" correccion="Escribe el nombre de la facultad." />
          </Formulario>
        </>
      )}
      <h2>Facultades registradas</h2>
      <Tabla
        titulo="Facultades registradas"
        filas={facultades}
        clave={(f) => f.clave}
        columnas={[
          { titulo: 'Clave', celda: (f) => f.clave },
          { titulo: 'Nombre', celda: (f) => f.nombre },
        ]}
      />
    </>
  );
}
