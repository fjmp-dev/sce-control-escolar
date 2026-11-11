import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logotipo } from '@/componentes/icono';
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
            <Logotipo />
            Sistema de Control Escolar
          </Link>
          <p className="persona">
            <span>{correo}</span>
            <span className="persona-rol">
              <span className="persona-separador" aria-hidden="true">
                {' · '}
              </span>
              {roles.map((rol) => ETIQUETA_ROL[rol]).join(', ')}
            </span>
          </p>
          <form action={cerrarSesion}>
            <button type="submit" className="boton boton-secundario">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <div className="portal">
        <Navegacion enlaces={menuDe(roles)} />
        <main id="contenido" tabIndex={-1} className="contenido">
          {children}
        </main>
      </div>
    </>
  );
}
