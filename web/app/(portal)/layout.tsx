import Link from 'next/link';
import type { ReactNode } from 'react';
import { Navegacion } from '@/componentes/navegacion';
import { cerrarSesion } from '@/lib/acciones';
import { sesionActual } from '@/lib/api';
import { ETIQUETA_ROL, menuDe } from '@/lib/roles';

export default async function LayoutPortal({ children }: { children: ReactNode }) {
  const { correo, roles } = await sesionActual();
  return (
    <>
      <header className="cabecera">
        <div className="cabecera-fila">
          <Link href="/" prefetch={false} className="marca">
            Sistema de Control Escolar
          </Link>
          <p className="persona">
            {correo} · {roles.map((rol) => ETIQUETA_ROL[rol]).join(', ')}
          </p>
          <form action={cerrarSesion}>
            <button type="submit" className="boton boton-secundario">
              Cerrar sesión
            </button>
          </form>
        </div>
        <Navegacion enlaces={menuDe(roles)} />
      </header>
      <main id="contenido" tabIndex={-1} className="contenido">
        {children}
      </main>
    </>
  );
}
