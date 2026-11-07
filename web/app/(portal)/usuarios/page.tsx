import { Campo, Casilla, Casillas, Formulario } from '@/componentes/formulario';
import { Tabla } from '@/componentes/tabla';
import { altaUsuario, cambiarUsuario } from '@/lib/acciones';
import { consultar, sesionActual } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { ETIQUETA_ROL, ROLES } from '@/lib/roles';

export const metadata = { title: 'Usuarios' };

const OPCIONES_DE_ROL = ROLES.map((valor) => ({ valor, etiqueta: ETIQUETA_ROL[valor] }));
const CORRECCION_ROLES = 'Marca al menos un rol.';
const CORRECCION_CONFIRMACION = 'Escribe tu contraseña para confirmar.';

export default async function PaginaUsuarios() {
  const [sesion, usuarios] = await Promise.all([
    sesionActual(),
    consultar<Esquemas['UsuarioRespuesta'][]>('/usuarios'),
  ]);
  return (
    <>
      <h1>Usuarios</h1>
      <h2>Dar de alta un usuario</h2>
      <Formulario accion={altaUsuario} envio="Dar de alta">
        <Campo
          nombre="correo"
          etiqueta="Correo institucional"
          tipo="email"
          autoComplete="off"
          correccion="Escribe un correo completo, como nombre@uaemex.mx."
        />
        <Campo
          nombre="contrasena"
          etiqueta="Contraseña inicial"
          tipo="password"
          autoComplete="new-password"
          ayuda="Al menos 12 caracteres, con letras y números, sin incluir el correo. Pídele a la persona que la cambie al entrar."
          correccion="Escribe la contraseña inicial."
        />
        <Casillas nombre="roles" etiqueta="Roles" correccion={CORRECCION_ROLES} opciones={OPCIONES_DE_ROL} />
        <Campo
          nombre="confirmacion"
          etiqueta="Tu contraseña, para confirmar"
          tipo="password"
          autoComplete="current-password"
          correccion={CORRECCION_CONFIRMACION}
        />
      </Formulario>
      <h2>Usuarios registrados</h2>
      <Tabla
        titulo="Usuarios registrados"
        filas={usuarios}
        clave={(u) => u.id}
        columnas={[
          { titulo: 'Correo', celda: (u) => u.correo },
          { titulo: 'Roles', celda: (u) => u.roles.map((rol) => ETIQUETA_ROL[rol]).join(', ') },
          { titulo: 'Estado', celda: (u) => (u.activo ? 'Activo' : 'Inactivo') },
          {
            titulo: 'Acceso',
            celda: (u) =>
              u.id === sesion.id ? (
                'Tu propia cuenta: otro administrador debe cambiarla.'
              ) : (
                <details>
                  <summary>Cambiar acceso de {u.correo}</summary>
                  <Formulario accion={cambiarUsuario} envio={`Guardar cambios de ${u.correo}`}>
                    <input type="hidden" name="id" value={u.id} />
                    <Casilla nombre="activo" etiqueta="Cuenta activa" marcada={u.activo} />
                    <Casillas
                      nombre="roles"
                      etiqueta="Roles"
                      correccion={CORRECCION_ROLES}
                      opciones={OPCIONES_DE_ROL}
                      marcadas={u.roles}
                    />
                    <Campo
                      nombre="confirmacion"
                      etiqueta="Tu contraseña, para confirmar"
                      tipo="password"
                      autoComplete="current-password"
                      correccion={CORRECCION_CONFIRMACION}
                    />
                  </Formulario>
                </details>
              ),
          },
        ]}
      />
    </>
  );
}
