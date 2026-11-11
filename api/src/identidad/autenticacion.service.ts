import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { BitacoraService, USUARIO_TECNICO } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { PrismaService } from '../persistencia/prisma.service';
import {
  credencialesInvalidas,
  estaBloqueado,
  LimitesDeSesion,
  Sesion,
  Usuario,
  validarContrasena,
  VENTANA_DE_FALLOS_MS,
} from './dominio/usuario';
import { UsuarioRepository } from './usuario.repository';

export const COSTO_BCRYPT = 10;
// Se compara contra este hash si la cuenta no existe: el tiempo de respuesta no revela qué cuentas hay.
const HASH_SIMULADO = bcrypt.hashSync('cuenta-inexistente', COSTO_BCRYPT);

interface Reclamos {
  sub: string;
  sv: number;
  ini: number;
}

export interface TokenEmitido {
  token: string;
  expiraEn: string;
}

export interface Autenticado {
  usuario: Usuario;
  sesion: Sesion;
}

const minutosDe = (variable: string, porOmision: number) => Number(process.env[variable] ?? porOmision) * 60;
const ahoraEnSegundos = () => Math.floor(Date.now() / 1000);

@Injectable()
export class AutenticacionService {
  private readonly limites: LimitesDeSesion = {
    normalSeg: minutosDe('SESION_MINUTOS', 60),
    privilegiadaSeg: minutosDe('SESION_PRIVILEGIADA_MINUTOS', 15),
    maximaSeg: minutosDe('SESION_MAXIMA_MINUTOS', 480),
  };

  constructor(
    private readonly jwt: JwtService,
    private readonly usuarios: UsuarioRepository,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  async iniciarSesion(correo: string, contrasena: string): Promise<TokenEmitido> {
    return this.emitir(await this.comprobar(await this.usuarios.porCorreo(correo), contrasena));
  }

  /** Cada petición lee al usuario: desactivar, revocar o quitar un rol surte efecto de inmediato. */
  async validarToken(token: string): Promise<Autenticado> {
    let reclamos: Reclamos;
    try {
      reclamos = await this.jwt.verifyAsync<Reclamos>(token);
    } catch {
      throw new UnauthorizedException();
    }
    const usuario = await this.usuarios.porId(reclamos.sub);
    if (!usuario?.activo || usuario.sesionVersion !== reclamos.sv || typeof reclamos.ini !== 'number') {
      throw new UnauthorizedException();
    }
    return { usuario, sesion: new Sesion(usuario.id, reclamos.sv, reclamos.ini) };
  }

  renovar(autenticado: Autenticado): Promise<TokenEmitido> {
    return this.emitir(autenticado);
  }

  /** CC-010: el logout incrementa la versión y todo token anterior de esa cuenta deja de valer. */
  cerrarSesion(usuario: Usuario): Promise<void> {
    return this.usuarios.revocarSesiones(usuario.id);
  }

  /** Control adicional para roles privilegiados (Parte B): confirmar la contraseña antes de tocar cuentas. */
  async confirmarContrasena(usuario: Usuario, contrasena: string): Promise<void> {
    try {
      await this.comprobar(usuario, contrasena);
    } catch {
      throw new ErrorDeNegocio('REAUTENTICACION_FALLIDA', 'La contraseña de confirmación no es correcta.');
    }
  }

  async cambiarContrasena(usuario: Usuario, actual: string, nueva: string): Promise<void> {
    await this.confirmarContrasena(usuario, actual);
    validarContrasena(nueva, usuario.correo);
    const hash = await bcrypt.hash(nueva, COSTO_BCRYPT);
    await this.prisma.transaccion(async () => {
      await this.usuarios.cambiarContrasena(usuario.id, hash);
      await this.bitacora.registrar({
        autor: usuario.id,
        accion: 'cambio_contrasena',
        entidad: `usuario:${usuario.id}`,
      });
    });
  }

  private async comprobar(usuario: Usuario | null, contrasena: string): Promise<Autenticado> {
    const correcta = await bcrypt.compare(contrasena, usuario?.hashContrasena ?? HASH_SIMULADO);
    const entidad = `usuario:${usuario?.id ?? 'desconocido'}`;
    const desde = new Date(Date.now() - VENTANA_DE_FALLOS_MS);
    const fallos = usuario ? await this.bitacora.contarDesde(entidad, 'acceso_fallido', desde) : 0;
    try {
      if (!usuario) throw credencialesInvalidas();
      return { usuario, sesion: usuario.autenticar(correcta, fallos, ahoraEnSegundos()) };
    } catch (error) {
      // El intento no se atribuye a la cuenta atacada: firma el usuario técnico y la entidad dice a cuál apuntó.
      const accion = estaBloqueado(fallos) ? 'acceso_bloqueado' : 'acceso_fallido';
      await this.bitacora.registrar({ autor: USUARIO_TECNICO, accion, entidad });
      throw error;
    }
  }

  private async emitir({ usuario, sesion }: Autenticado): Promise<TokenEmitido> {
    const ahora = ahoraEnSegundos();
    const duracion = sesion.segundosDeVida(usuario.privilegiado, ahora, this.limites);
    const reclamos: Reclamos = { sub: usuario.id, sv: sesion.version, ini: sesion.inicioSeg };
    return {
      token: await this.jwt.signAsync(reclamos, { expiresIn: duracion }),
      expiraEn: new Date((ahora + duracion) * 1000).toISOString(),
    };
  }
}
