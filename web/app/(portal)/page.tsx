import Link from 'next/link';
import { sesionActual } from '@/lib/api';
import { ETIQUETA_ROL, menuDe } from '@/lib/roles';

export const metadata = { title: 'Inicio' };

export default async function PaginaInicio() {
  const { roles } = await sesionActual();
  return (
    <>
      <h1>Inicio</h1>
      <p>Entraste como {roles.map((rol) => ETIQUETA_ROL[rol]).join(', ')}. Esto es lo que puedes hacer por ahora:</p>
      <ul className="lista-enlaces">
        {menuDe(roles).map(({ ruta, etiqueta, descripcion }) => (
          <li key={ruta}>
            <Link href={ruta} prefetch={false}>
              {etiqueta}
            </Link>
            <span>{descripcion}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
