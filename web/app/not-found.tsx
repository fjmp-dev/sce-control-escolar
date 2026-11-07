import Link from 'next/link';

export const metadata = { title: 'Página no encontrada' };

export default function PaginaNoEncontrada() {
  return (
    <main id="contenido" tabIndex={-1} className="contenido">
      <h1>Esta página no existe</h1>
      <p>
        Revisa la dirección o vuelve al <Link href="/">inicio</Link>.
      </p>
    </main>
  );
}
