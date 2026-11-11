'use client';
import { Aviso } from '@/componentes/aviso';

/** Nunca muestra el detalle técnico: solo la causa probable y qué hacer (28.1). */
export default function PaginaDeError({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" tabIndex={-1} className="contenido">
      <h1>No pudimos cargar esta página</h1>
      <Aviso tipo="error">Puede ser una falla temporal del servidor. Intenta de nuevo en unos minutos.</Aviso>
      <p>
        <button type="button" className="boton" onClick={reset}>
          Intentar de nuevo
        </button>
      </p>
    </main>
  );
}
