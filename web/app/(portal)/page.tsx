import Link from 'next/link';
import { ICONO_DE_RUTA, Icono } from '@/componentes/icono';
import { sesionActual } from '@/lib/api';
import { ETIQUETA_ROL, menuDe } from '@/lib/roles';

export const metadata = { title: 'Inicio' };

export default async function PaginaInicio() {
  const { roles } = await sesionActual();
  return (
    <>
      <h1>Inicio</h1>
      <p className="entrada">
        Entraste como {roles.map((rol) => ETIQUETA_ROL[rol]).join(', ')}. Esto es lo que puedes hacer:
      </p>
      <ul className="rejilla">
        {menuDe(roles).map(({ ruta, etiqueta, descripcion }) => (
          <li key={ruta} className="tarjeta tarjeta-enlace">
            {ICONO_DE_RUTA[ruta] && <Icono nombre={ICONO_DE_RUTA[ruta]} className="icono tarjeta-icono" />}
            <h2 className="tarjeta-titulo">
              <Link href={ruta} prefetch={false}>
                {etiqueta}
              </Link>
            </h2>
            <p>{descripcion}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
