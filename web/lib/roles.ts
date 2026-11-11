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

const CATALOGOS: { ruta: string; etiqueta: string; catalogo: Catalogo; que: string }[] = [
  { ruta: '/facultades', etiqueta: 'Facultades', catalogo: 'facultades', que: 'las facultades y sus claves' },
  {
    ruta: '/planes',
    etiqueta: 'Planes de estudio',
    catalogo: 'planes',
    que: 'los planes de estudio, su facultad y sus créditos',
  },
  {
    ruta: '/materias',
    etiqueta: 'Materias',
    catalogo: 'materias',
    que: 'las materias de cada plan, sus créditos y prerrequisitos',
  },
  {
    ruta: '/periodos',
    etiqueta: 'Periodos',
    catalogo: 'periodos',
    que: 'los periodos escolares, sus fechas y su estado',
  },
];

export interface Enlace {
  ruta: string;
  etiqueta: string;
  descripcion: string;
  /** Encabezado bajo el que aparece en la barra lateral: el rol, Catálogos o Cuenta. */
  grupo: string;
}

/** Lo propio de cada rol, en el orden del menú. */
const PROPIOS: [Rol, Omit<Enlace, 'grupo'>[]][] = [
  [
    'alumno',
    [
      {
        ruta: '/inscripcion',
        etiqueta: 'Inscripción',
        descripcion: 'Armar tu carga, enviarla, ajustarla e imprimir tu comprobante',
      },
      { ruta: '/mi-horario', etiqueta: 'Mi horario', descripcion: 'Consultar las sesiones de tu carga confirmada' },
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
      { ruta: '/mi-cuenta', etiqueta: 'Mi cuenta', descripcion: 'Consultar tu saldo, pagar e imprimir tus recibos' },
      {
        ruta: '/mis-tramites',
        etiqueta: 'Mis trámites',
        descripcion: 'Solicitar constancias e historial, seguir su estado y descargarlos',
      },
    ],
  ],
  [
    'profesor',
    [
      {
        ruta: '/mis-grupos',
        etiqueta: 'Mis grupos',
        descripcion: 'Consultar tus grupos, inscritos y horario, y capturar calificaciones',
      },
    ],
  ],
  [
    'coordinacion',
    [
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
    ],
  ],
  [
    'control_escolar',
    [
      {
        ruta: '/expedientes',
        etiqueta: 'Expedientes',
        descripcion: 'Buscar, dar de alta, cambiar de plantel y de estatus',
      },
      {
        ruta: '/tramites',
        etiqueta: 'Trámites',
        descripcion: 'Atender solicitudes: tomar, emitir o rechazar, y verificar documentos',
      },
    ],
  ],
  [
    'caja',
    [{ ruta: '/caja', etiqueta: 'Caja', descripcion: 'Estado de cuenta, becas, cargos del periodo y corte del día' }],
  ],
  [
    'direccion',
    [
      {
        ruta: '/reportes',
        etiqueta: 'Reportes',
        descripcion: 'Inscripción, avance y cobranza por facultad y de la universidad',
      },
    ],
  ],
  [
    'administrador',
    [{ ruta: '/usuarios', etiqueta: 'Usuarios', descripcion: 'Dar de alta, cambiar roles y dar de baja' }],
  ],
];

export function menuDe(roles: readonly Rol[]): Enlace[] {
  const propios = PROPIOS.filter(([rol]) => roles.includes(rol)).flatMap(([rol, enlaces]) =>
    enlaces.map((enlace) => ({ ...enlace, grupo: ETIQUETA_ROL[rol] })),
  );
  const catalogos = CATALOGOS.map(({ ruta, etiqueta, catalogo, que }) => ({
    ruta,
    etiqueta,
    descripcion: `${puedeDarDeAlta(catalogo, roles) ? 'Consultar y dar de alta' : 'Consultar'} ${que}`,
    grupo: 'Catálogos',
  }));
  return [
    ...propios,
    ...catalogos,
    { ruta: '/contrasena', etiqueta: 'Mi contraseña', descripcion: 'Cambiar tu contraseña de acceso', grupo: 'Cuenta' },
  ];
}
