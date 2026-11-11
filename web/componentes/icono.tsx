import type { ReactNode } from 'react';

/** Trazos propios de 24x24, sin dependencias. Son decorativos: el texto de al lado da el nombre (28.1). */
const TRAZOS = {
  inicio: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  inscripcion: (
    <>
      <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  horario: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calificaciones: <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  expediente: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.5-1.4 1.6-2.2 3-2.2s2.5.8 3 2.2" />
      <path d="M15 10h3M15 14h3" />
    </>
  ),
  cuenta: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M16 15h2" />
    </>
  ),
  tramites: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  grupos: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5a3 3 0 0 1 0 6M18 14c1.8.8 3 2.6 3 6" />
    </>
  ),
  oferta: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  correcciones: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </>
  ),
  expedientes: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  caja: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  reportes: <path d="M4 20h16M7 16v-5M12 16V6M17 16V9" />,
  usuarios: (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 21c0-3.9 3.1-7 7-7 1.5 0 2.9.5 4 1.3M19 14v6M16 17h6" />
    </>
  ),
  facultades: <path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />,
  planes: <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />,
  materias: (
    <>
      <path d="M4 18.5V5a2 2 0 0 1 2-2h14v18H6.5A2.5 2.5 0 0 1 4 18.5" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </>
  ),
  periodos: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  contrasena: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
} satisfies Record<string, ReactNode>;

export type NombreIcono = keyof typeof TRAZOS;

export const ICONO_DE_RUTA: Record<string, NombreIcono> = {
  '/': 'inicio',
  '/inscripcion': 'inscripcion',
  '/mi-horario': 'horario',
  '/mis-calificaciones': 'calificaciones',
  '/mi-expediente': 'expediente',
  '/mi-cuenta': 'cuenta',
  '/mis-tramites': 'tramites',
  '/mis-grupos': 'grupos',
  '/oferta': 'oferta',
  '/correcciones': 'correcciones',
  '/expedientes': 'expedientes',
  '/tramites': 'tramites',
  '/caja': 'caja',
  '/reportes': 'reportes',
  '/usuarios': 'usuarios',
  '/facultades': 'facultades',
  '/planes': 'planes',
  '/materias': 'materias',
  '/periodos': 'periodos',
  '/contrasena': 'contrasena',
};

export function Icono({ nombre, className = 'icono' }: { nombre: NombreIcono; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {TRAZOS[nombre]}
    </svg>
  );
}

/** La marca de app/icon.svg, en línea; en la cabecera azul el CSS invierte sus colores. */
export function Logotipo() {
  return (
    <svg className="logotipo" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="#1a5fb4" />
      <path fill="none" stroke="#ffffff" strokeWidth="3" d="M22 10c-2-3-11-3-11 2s11 3 11 8-9 5-11 2" />
    </svg>
  );
}
