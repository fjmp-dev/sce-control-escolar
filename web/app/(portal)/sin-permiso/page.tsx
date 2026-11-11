import Link from 'next/link';
import { Aviso } from '@/componentes/aviso';

export const metadata = { title: 'Sin permiso' };

export default function PaginaSinPermiso() {
  return (
    <>
      <h1>No tienes permiso para ver esa página</h1>
      <Aviso tipo="error">Tu rol no incluye esa función.</Aviso>
      <p>
        Vuelve al <Link href="/">inicio</Link> para ver lo que sí te corresponde. Si crees que es un error, pídele el
        cambio al administrador del sistema.
      </p>
    </>
  );
}
