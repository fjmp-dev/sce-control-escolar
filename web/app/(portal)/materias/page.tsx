import { Campo, Casilla, Formulario, Selector } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { agregarPrerrequisito, crearMateria, quitarPrerrequisito } from '@/lib/acciones';
import { consultar, sesionActual } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { puedeDarDeAlta } from '@/lib/roles';
import { AYUDA_CLAVE, CORRECCION_CLAVE } from '@/lib/textos';

export const metadata = { title: 'Materias' };

export default async function PaginaMaterias() {
  const [{ roles }, materias, planes] = await Promise.all([
    sesionActual(),
    consultar<Esquemas['MateriaRespuesta'][]>('/materias'),
    consultar<Esquemas['PlanRespuesta'][]>('/planes'),
  ]);
  const edita = puedeDarDeAlta('materias', roles);
  const opcionesDeMateria = materias.map((m) => ({ valor: m.clave, etiqueta: `${m.clave} · ${m.nombre}` }));
  return (
    <>
      <h1>Materias</h1>
      {edita && (
        <>
          <h2>Dar de alta una materia</h2>
          <Formulario accion={crearMateria} envio="Dar de alta">
            <Campo nombre="clave" etiqueta="Clave" ayuda={AYUDA_CLAVE} correccion={CORRECCION_CLAVE} />
            <Selector
              nombre="planClave"
              etiqueta="Plan de estudios"
              correccion="Elige el plan de la materia."
              opciones={planes.map((p) => ({ valor: p.clave, etiqueta: p.clave }))}
            />
            <Campo nombre="nombre" etiqueta="Nombre" correccion="Escribe el nombre de la materia." />
            <Campo
              nombre="creditos"
              etiqueta="Créditos"
              tipo="number"
              correccion="Escribe un número entero, de 1 a 10000."
            />
          </Formulario>
          <h2>Agregar un prerrequisito</h2>
          <Formulario accion={agregarPrerrequisito} envio="Agregar prerrequisito">
            <Selector nombre="materia" etiqueta="Materia" correccion="Elige la materia." opciones={opcionesDeMateria} />
            <Selector
              nombre="requiereClave"
              etiqueta="Requiere haber cursado"
              correccion="Elige la materia que se requiere."
              opciones={opcionesDeMateria}
            />
            <Casilla nombre="obligatorio" etiqueta="Es obligatorio para inscribirse" marcada />
          </Formulario>
          <h2>Quitar un prerrequisito</h2>
          <Formulario accion={quitarPrerrequisito} envio="Quitar prerrequisito">
            <Selector
              nombre="prerrequisito"
              etiqueta="Prerrequisito a quitar"
              correccion="Elige el prerrequisito que vas a quitar."
              opciones={materias.flatMap(({ clave, requiereDe = [] }) =>
                requiereDe.map((p) => ({
                  valor: `${clave}|${p.requiereClave}`,
                  etiqueta: `${clave} requiere ${p.requiereClave}`,
                })),
              )}
            />
          </Formulario>
        </>
      )}
      <h2>Materias registradas</h2>
      <Tabla
        titulo="Materias registradas"
        filas={materias}
        clave={(m) => m.clave}
        columnas={[
          { titulo: 'Clave', celda: (m) => m.clave },
          { titulo: 'Nombre', celda: (m) => m.nombre },
          { titulo: 'Plan', celda: (m) => m.planClave },
          { titulo: 'Créditos', celda: (m) => m.creditos },
          {
            titulo: 'Prerrequisitos',
            celda: ({ requiereDe = [] }) =>
              requiereDe.length === 0
                ? 'Ninguno'
                : requiereDe
                    .map((p) => `${p.requiereClave} (${p.obligatorio ? 'obligatorio' : 'opcional'})`)
                    .join(', '),
          },
        ]}
      />
    </>
  );
}
