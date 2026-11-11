'use client';
import Link from 'next/link';
import { Aviso } from '@/componentes/aviso';
import { Icono, Logotipo } from '@/componentes/icono';

/** Nunca muestra el detalle técnico: solo la causa probable y qué hacer (28.1). Fuera del portal, como el ingreso. */
export default function PaginaDeError({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" tabIndex={-1} className="ingreso">
      <div className="tarjeta ingreso-tarjeta">
        <p className="marca">
          <Logotipo />
          Sistema de Control Escolar
        </p>
        <h1>No pudimos cargar esta página</h1>
        <Aviso tipo="error">Puede ser una falla temporal del servidor. Intenta de nuevo en unos minutos.</Aviso>
        <div className="botones">
          <button type="button" className="boton" onClick={reset}>
            Intentar de nuevo
          </button>
          <Link href="/" className="boton boton-secundario">
            <Icono nombre="inicio" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
