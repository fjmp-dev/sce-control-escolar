import Link from 'next/link';
import { Campo, Formulario, Selector } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { altaExpediente } from '@/lib/acciones';
import { consultar } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ESTATUS } from '@/lib/formato';
import { CORRECCION_FECHA } from '@/lib/textos';

export const metadata = { title: 'Expedientes' };

export default async function PaginaExpedientes({
  searchParams,
}: Readonly<{ searchParams: Promise<{ buscar?: string }> }>) {
  const buscar = ((await searchParams).buscar ?? '').trim();
  const [alumnos, facultades] = await Promise.all([
    consultar<Esquemas['AlumnoResumen'][]>(`/alumnos${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ''}`),
    consultar<Esquemas['FacultadRespuesta'][]>('/facultades'),
  ]);
  return (
    <>
      <h1>Expedientes</h1>
      <form method="get" className="busqueda" role="search">
        <label htmlFor="buscar">Buscar por matrícula o nombre</label>
        <input id="buscar" name="buscar" type="search" defaultValue={buscar} maxLength={100} />
        <button type="submit" className="boton">
          Buscar
        </button>
      </form>
      <h2>{buscar ? `Resultados para «${buscar}»` : 'Expedientes recientes'}</h2>
      <p className="ayuda">Se muestran hasta 50. Afina la búsqueda si no aparece el que buscas.</p>
      <Tabla
        titulo="Expedientes"
        filas={alumnos}
        clave={(a) => a.matricula}
        columnas={[
          {
            titulo: 'Matrícula',
            celda: (a) => (
              <Link href={`/expedientes/${a.matricula}`} prefetch={false}>
                {a.matricula}
              </Link>
            ),
          },
          { titulo: 'Nombre', celda: (a) => a.nombre },
          { titulo: 'Facultad', celda: (a) => a.facultadClave },
          { titulo: 'Estatus', celda: (a) => ETIQUETA_ESTATUS[a.estatus] ?? a.estatus },
        ]}
      />
      <h2>Dar de alta un expediente</h2>
      <Formulario accion={altaExpediente} envio="Dar de alta">
        <Campo
          nombre="matricula"
          etiqueta="Matrícula"
          ayuda="De 7 a 10 dígitos. Es única y no cambia, aunque el alumno cambie de plantel."
          correccion="Escribe solo dígitos, de 7 a 10."
        />
        <Campo nombre="nombre" etiqueta="Nombre completo" correccion="Escribe el nombre del alumno." />
        <Selector
          nombre="facultadClave"
          etiqueta="Facultad"
          correccion="Elige la facultad del alumno."
          opciones={facultades.map((f) => ({ valor: f.clave, etiqueta: `${f.clave} · ${f.nombre}` }))}
        />
        <Campo nombre="fechaIngreso" etiqueta="Fecha de ingreso" tipo="date" correccion={CORRECCION_FECHA} />
        <CampoOpcionalDeCorreo />
      </Formulario>
    </>
  );
}

function CampoOpcionalDeCorreo() {
  return (
    <Campo
      nombre="correo"
      etiqueta="Correo de la cuenta del alumno (opcional)"
      tipo="email"
      autoComplete="off"
      ayuda="Si ya tiene cuenta de alumno, para que consulte su expediente. Se puede vincular después."
      correccion="Escribe un correo completo, como nombre@uaemex.mx."
      opcional
    />
  );
}
