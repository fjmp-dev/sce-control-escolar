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
            ruta: '/inscripcion',
            etiqueta: 'Inscripción',
            descripcion: 'Armar tu carga, enviarla, ajustarla e imprimir tu comprobante',
          },
          {
            ruta: '/mi-horario',
            etiqueta: 'Mi horario',
            descripcion: 'Consultar las sesiones de tu carga confirmada',
          },
          {
            ruta: '/mis-calificaciones',
            etiqueta: 'Mis calificaciones',
            descripcion: 'Consultar tus parciales al momento, tu kárdex y tu avance',
          },
          {
            ruta: '/mi-expediente',
            etiqueta: 'Mi expediente',
            descripcion: 'Consultar tus datos, historial y trayectoria',
          },
        ]
      : []),
    ...(roles.includes('profesor')
      ? [
          {
            ruta: '/mis-grupos',
            etiqueta: 'Mis grupos',
            descripcion: 'Consultar tus grupos, inscritos y horario, y capturar calificaciones',
          },
        ]
      : []),
    ...(roles.includes('coordinacion')
      ? [
          {
            ruta: '/oferta',
            etiqueta: 'Oferta',
            descripcion: 'Definir grupos, profesores, aulas y horarios, y publicar la oferta',
          },
          {
            ruta: '/correcciones',
            etiqueta: 'Correcciones',
            descripcion: 'Autorizar la corrección de una calificación después del cierre',
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
