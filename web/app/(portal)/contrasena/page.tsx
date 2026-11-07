import { Campo, Formulario } from '@/componentes/formulario';
import { cambiarContrasena } from '@/lib/acciones';

export const metadata = { title: 'Mi contraseña' };

export default function PaginaContrasena() {
  return (
    <>
      <h1>Mi contraseña</h1>
      <p>Al cambiarla se cierran tus sesiones abiertas y tendrás que entrar de nuevo.</p>
      <Formulario accion={cambiarContrasena} envio="Cambiar contraseña">
        <Campo
          nombre="actual"
          etiqueta="Contraseña actual"
          tipo="password"
          autoComplete="current-password"
          correccion="Escribe tu contraseña actual."
        />
        <Campo
          nombre="nueva"
          etiqueta="Contraseña nueva"
          tipo="password"
          autoComplete="new-password"
          ayuda="Al menos 12 caracteres, con letras y números, sin incluir tu correo."
          correccion="Escribe la contraseña nueva."
        />
      </Formulario>
    </>
  );
}
