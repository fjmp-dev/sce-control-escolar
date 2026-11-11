import Link from 'next/link';
import { Icono, Logotipo } from '@/componentes/icono';

export const metadata = { title: 'Página no encontrada' };

/** Fuera del portal, como el ingreso: tarjeta centrada con la marca. */
export default function PaginaNoEncontrada() {
  return (
    <main id="contenido" tabIndex={-1} className="ingreso">
      <div className="tarjeta ingreso-tarjeta">
        <p className="marca">
          <Logotipo />
          Sistema de Control Escolar
        </p>
        <h1>Esta página no existe</h1>
        <p className="ayuda">Revisa la dirección o vuelve al inicio.</p>
        <div className="botones">
          <Link href="/" className="boton">
            <Icono nombre="inicio" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
