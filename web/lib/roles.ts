import type { Rol } from './contrato';

export const ETIQUETA_ROL: Record<Rol, string> = {
  alumno: 'Alumno',
  profesor: 'Profesor',
  control_escolar: 'Control escolar',
  coordinacion: 'Coordinación académica',
  caja: 'Caja',
  direccion: 'Dirección',
  administrador: 'Administrador del sistema',
};
export const ROLES = Object.keys(ETIQUETA_ROL) as Rol[];

/**
 * Qué ofrece el portal a cada rol. Es solo presentación: quien autoriza es la API.
 * test/roles.test.ts lo compara con docs/calidad/matriz-rol-endpoint.md.
 */
export const ALTAS = {
  facultades: ['administrador'],
  planes: ['administrador'],
  materias: ['coordinacion'],
  periodos: ['coordinacion'],
} as const satisfies Record<string, readonly Rol[]>;

export type Catalogo = keyof typeof ALTAS;

export const puedeDarDeAlta = (catalogo: Catalogo, roles: readonly Rol[]) =>
  roles.some((rol) => (ALTAS[catalogo] as readonly Rol[]).includes(rol));

const CATALOGOS: { ruta: string; etiqueta: string; catalogo: Catalogo }[] = [
  { ruta: '/facultades', etiqueta: 'Facultades', catalogo: 'facultades' },
  { ruta: '/planes', etiqueta: 'Planes de estudio', catalogo: 'planes' },
  { ruta: '/materias', etiqueta: 'Materias', catalogo: 'materias' },
  { ruta: '/periodos', etiqueta: 'Periodos', catalogo: 'periodos' },
];

export interface Enlace {
  ruta: string;
  etiqueta: string;
  descripcion: string;
}

export function menuDe(roles: readonly Rol[]): Enlace[] {
  const catalogos = CATALOGOS.map(({ ruta, etiqueta, catalogo }) => ({
    ruta,
    etiqueta,
    descripcion: puedeDarDeAlta(catalogo, roles) ? 'Consultar y dar de alta' : 'Consultar',
  }));
  const propios: Enlace[] = [
    ...(roles.includes('alumno')
      ? [
          {
            ruta: '/mi-expediente',
            etiqueta: 'Mi expediente',
            descripcion: 'Consultar tus datos, historial y trayectoria',
          },
        ]
      : []),
    ...(roles.includes('control_escolar')
      ? [
          {
            ruta: '/expedientes',
            etiqueta: 'Expedientes',
            descripcion: 'Buscar, dar de alta, cambiar de plantel y de estatus',
          },
        ]
      : []),
    ...(roles.includes('administrador')
      ? [{ ruta: '/usuarios', etiqueta: 'Usuarios', descripcion: 'Dar de alta, cambiar roles y dar de baja' }]
      : []),
  ];
  return [...propios, ...catalogos, { ruta: '/contrasena', etiqueta: 'Mi contraseña', descripcion: 'Cambiarla' }];
}
