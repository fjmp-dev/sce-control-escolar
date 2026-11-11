'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { Enlace } from '@/lib/roles';
import { ICONO_DE_RUTA, Icono } from './icono';

/**
 * Barra lateral agrupada. En celular (<= 48rem) la lista se oculta tras el botón Menú;
 * se abre en la ruta donde se pulsó, así que al navegar se cierra sola. Sin JavaScript la lista queda abierta y el
 * botón, que no haría nada, se oculta (Tabla 15). En una subpágina se marca su sección con aria-current="true".
 * Al navegar desde el menú abierto, el enlace con el foco se oculta: el foco pasa al contenido (Next no lo mueve).
 */
export function Navegacion({ enlaces }: { enlaces: Enlace[] }) {
  const actual = usePathname();
  const id = useId();
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn === actual;
  const desdeMenu = useRef(false);

  useEffect(() => {
    if (!desdeMenu.current) return;
    desdeMenu.current = false;
    document.getElementById('contenido')?.focus();
  }, [actual]);

  const grupos = new Map<string, Enlace[]>();
  for (const enlace of enlaces) grupos.set(enlace.grupo, [...(grupos.get(enlace.grupo) ?? []), enlace]);

  const elemento = ({ ruta, etiqueta }: { ruta: string; etiqueta: string }) => (
    <li key={ruta}>
      <Link
        href={ruta}
        prefetch={false}
        onClick={() => {
          if (abierto && ruta !== actual) desdeMenu.current = true;
        }}
        aria-current={actual === ruta ? 'page' : ruta !== '/' && actual.startsWith(`${ruta}/`) ? 'true' : undefined}
      >
        {ICONO_DE_RUTA[ruta] && <Icono nombre={ICONO_DE_RUTA[ruta]} />}
        {etiqueta}
      </Link>
    </li>
  );

  return (
    <nav aria-label="Principal" className="navegacion">
      <noscript>
        <style>{'.navegacion-lista{display:block!important}.navegacion-boton{display:none!important}'}</style>
      </noscript>
      <button
        type="button"
        className="navegacion-boton"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbiertoEn(abierto ? null : actual)}
      >
        <Icono nombre="menu" />
        Menú
      </button>
      <div id={id} className="navegacion-lista" data-abierto={abierto || undefined}>
        <ul>{elemento({ ruta: '/', etiqueta: 'Inicio' })}</ul>
        {[...grupos].map(([grupo, delGrupo], i) => (
          <div key={grupo}>
            <p id={`${id}-${i}`} className="navegacion-grupo">
              {grupo}
            </p>
            <ul aria-labelledby={`${id}-${i}`}>{delGrupo.map(elemento)}</ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
