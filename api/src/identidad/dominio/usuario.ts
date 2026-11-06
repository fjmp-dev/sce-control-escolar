import { ErrorDeNegocio } from '../../dominio/error-de-negocio';

// Dominio puro de identidad y acceso (14.1-8): sin Nest ni Prisma, se prueba sin base de datos.

/** RF-008: los seis roles de uso, más el rol técnico de CC-007. */
export const ROLES = [
  'alumno',
  'profesor',
  'control_escolar',
  'coordinacion',
  'caja',
  'direccion',
  'administrador',
] as const;
export type ClaveRol = (typeof ROLES)[number];

/** Parte B de PA-SCE-001: estos roles tienen sesión corta y confirman su contraseña en operaciones de cuentas. */
const PRIVILEGIADOS: readonly ClaveRol[] = ['administrador'];

/** Tabla 15, Resistencia: fuerza bruta. */
export const MAX_FALLOS = 5;
export const VENTANA_DE_FALLOS_MS = 15 * 60_000;

export const estaBloqueado = (fallosRecientes: number) => fallosRecientes >= MAX_FALLOS;

export interface LimitesDeSesion {
  normalSeg: number;
  privilegiadaSeg: number;
  maximaSeg: number;
}

export class Sesion {
  constructor(
    readonly usuarioId: string,
    readonly version: number,
    readonly inicioSeg: number,
  ) {}

  /**
   * Tabla 38, renovación controlada: cada token vive lo que marca su rol y ninguno rebasa la
   * sesión máxima contada desde el inicio de sesión, por más veces que se renueve.
   */
  segundosDeVida(privilegiado: boolean, ahoraSeg: number, limites: LimitesDeSesion): number {
    const restante = this.inicioSeg + limites.maximaSeg - ahoraSeg;
    if (restante <= 0) throw new ErrorDeNegocio('SESION_VENCIDA', 'Tu sesión venció. Vuelve a iniciar sesión.');
    return Math.min(privilegiado ? limites.privilegiadaSeg : limites.normalSeg, restante);
  }
}

export class Usuario {
  constructor(
    readonly id: string,
    readonly correo: string,
    readonly hashContrasena: string,
    readonly activo: boolean,
    readonly sesionVersion: number,
    readonly roles: readonly ClaveRol[],
  ) {}

  get privilegiado(): boolean {
    return this.roles.some((rol) => PRIVILEGIADOS.includes(rol));
  }

  /**
   * Fig. 3. El mismo error para todo motivo: no revela si la cuenta existe, está inactiva o está bloqueada.
   * Una contraseña correcta tampoco entra mientras dure el bloqueo.
   */
  autenticar(contrasenaCorrecta: boolean, fallosRecientes: number, ahoraSeg: number): Sesion {
    if (!this.activo || !contrasenaCorrecta || estaBloqueado(fallosRecientes)) throw credencialesInvalidas();
    return new Sesion(this.id, this.sesionVersion, ahoraSeg);
  }
}

export const credencialesInvalidas = () =>
  new ErrorDeNegocio(
    'CREDENCIALES_INVALIDAS',
    'Correo o contraseña incorrectos, o cuenta bloqueada por 15 minutos tras varios intentos fallidos.',
  );

const LONGITUD_MINIMA = 12;
const BYTES_MAXIMOS = 72; // bcrypt ignora lo que sigue
const CARACTERES_DISTINTOS = 5;

/** Parte B de PA-SCE-001: política de contraseñas. */
export function validarContrasena(contrasena: string, correo: string): void {
  const parteLocal = correo.split('@')[0].toLowerCase();
  const incumple =
    contrasena.length < LONGITUD_MINIMA ||
    Buffer.byteLength(contrasena) > BYTES_MAXIMOS ||
    !/\p{L}/u.test(contrasena) ||
    !/\p{N}/u.test(contrasena) ||
    new Set(contrasena).size < CARACTERES_DISTINTOS ||
    contrasena.toLowerCase().includes(parteLocal);
  if (incumple) {
    throw new ErrorDeNegocio(
      'CONTRASENA_DEBIL',
      `La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres, con letras y números, y no contener tu correo.`,
    );
  }
}
