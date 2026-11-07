import { Aviso } from '@/componentes/aviso';
import { Campo, Formulario } from '@/componentes/formulario';
import { iniciarSesion } from '@/lib/acciones';

export const metadata = { title: 'Iniciar sesión' };

const MOTIVOS: Record<string, string> = {
  sesion: 'Tu sesión terminó. Vuelve a iniciar sesión para continuar.',
  contrasena: 'Tu contraseña cambió. Inicia sesión con la nueva.',
};

export default async function PaginaIngresar({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const aviso = motivo && Object.hasOwn(MOTIVOS, motivo) ? MOTIVOS[motivo] : undefined;
  return (
    <main id="contenido" tabIndex={-1} className="contenido contenido-angosto">
      <p className="marca">Sistema de Control Escolar</p>
      <h1>Iniciar sesión</h1>
      {aviso && <Aviso tipo="informacion">{aviso}</Aviso>}
      <Formulario accion={iniciarSesion} envio="Entrar">
        <Campo
          nombre="correo"
          etiqueta="Correo institucional"
          tipo="email"
          autoComplete="username"
          correccion="Escribe un correo completo, como nombre@uaemex.mx."
        />
        <Campo
          nombre="contrasena"
          etiqueta="Contraseña"
          tipo="password"
          autoComplete="current-password"
          correccion="Escribe tu contraseña."
        />
      </Formulario>
    </main>
  );
}
