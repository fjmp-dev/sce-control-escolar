import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Sistema de Control Escolar', template: '%s · SCE' },
  description: 'Portal del Sistema de Control Escolar Universitario',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

// La CSP lleva un nonce por petición (proxy.ts): una página prerenderizada no lo tendría y sus scripts no correrían.
export default async function LayoutRaiz({ children }: { children: ReactNode }) {
  await connection();
  return (
    <html lang="es-MX">
      <body>
        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
