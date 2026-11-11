import Link from 'next/link';
import { Aviso } from '@/componentes/aviso';
import { Logotipo } from '@/componentes/icono';
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
    <main id="contenido" tabIndex={-1} className="ingreso">
      <div className="tarjeta ingreso-tarjeta">
        <p className="marca">
          <Logotipo />
          Sistema de Control Escolar
        </p>
        <h1>Iniciar sesión</h1>
        <p className="ayuda">Entra con tu correo institucional y tu contraseña.</p>
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
        <p className="ayuda">
          <Link href="/privacidad">Aviso de privacidad</Link>
        </p>
      </div>
    </main>
  );
}
