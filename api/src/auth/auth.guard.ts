import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

export type ClaveRol = 'alumno' | 'profesor' | 'control_escolar' | 'coordinacion' | 'caja' | 'direccion';

export const Publico = () => SetMetadata('publico', true);
export const Roles = (...roles: ClaveRol[]) => SetMetadata('roles', roles);

export interface UsuarioSesion {
  id: string;
  roles: ClaveRol[];
}

/**
 * RF-008: autentica el JWT y autoriza por rol. Los roles se leen de la base en
 * cada peticion, no del token: desactivar al usuario o quitarle un rol surte
 * efecto de inmediato (equivale a revocar el token, caso CS-SEG-04).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const objetivos = [ctx.getHandler(), ctx.getClass()];
    if (this.reflector.getAllAndOverride<boolean>('publico', objetivos)) return true;

    const req = ctx.switchToHttp().getRequest();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException();

    let sub: string;
    try {
      ({ sub } = await this.jwt.verifyAsync<{ sub: string }>(token));
    } catch {
      throw new UnauthorizedException();
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: sub },
      select: { activo: true, roles: { select: { rol: { select: { clave: true } } } } },
    });
    if (!usuario?.activo) throw new UnauthorizedException();

    const sesion: UsuarioSesion = { id: sub, roles: usuario.roles.map((r) => r.rol.clave as ClaveRol) };
    req.usuario = sesion;

    const requeridos = this.reflector.getAllAndOverride<ClaveRol[]>('roles', objetivos);
    if (requeridos && !requeridos.some((r) => sesion.roles.includes(r))) throw new ForbiddenException();
    return true;
  }
}
