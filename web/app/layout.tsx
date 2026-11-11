import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Sistema de Control Escolar', template: '%s · SCE' },
  description: 'Portal del Sistema de Control Escolar Universitario',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function LayoutRaiz({ children }: { children: ReactNode }) {
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
