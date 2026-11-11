import Link from 'next/link';
import { Aviso } from '@/componentes/aviso';
import { Icono } from '@/componentes/icono';

export const metadata = { title: 'Sin permiso' };

export default function PaginaSinPermiso() {
  return (
    <div className="tarjeta ingreso-tarjeta">
      <Icono nombre="contrasena" className="icono tarjeta-icono" />
      <h1>No tienes permiso para ver esa página</h1>
      <Aviso tipo="error">Tu rol no incluye esa función.</Aviso>
      <p className="ayuda">Si crees que es un error, pídele el cambio al administrador del sistema.</p>
      <div className="botones">
        <Link href="/" className="boton">
          <Icono nombre="inicio" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
