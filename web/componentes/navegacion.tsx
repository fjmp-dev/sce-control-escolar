'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Enlace } from '@/lib/roles';

export function Navegacion({ enlaces }: { enlaces: Enlace[] }) {
  const actual = usePathname();
  return (
    <nav aria-label="Principal" className="navegacion">
      <ul>
        {[{ ruta: '/', etiqueta: 'Inicio' }, ...enlaces].map(({ ruta, etiqueta }) => (
          <li key={ruta}>
            <Link href={ruta} prefetch={false} aria-current={actual === ruta ? 'page' : undefined}>
              {etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
