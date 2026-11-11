import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Autenticado, AutenticacionService } from './autenticacion.service';
import { ClaveRol } from './dominio/usuario';

export const Publico = () => SetMetadata('publico', true);
export const Roles = (...roles: ClaveRol[]) => applyDecorators(SetMetadata('roles', roles), ApiBearerAuth());

interface Peticion {
  headers: { authorization?: string };
  autenticado?: Autenticado;
}

export const Actual = createParamDecorator(
  (_: unknown, contexto: ExecutionContext) => contexto.switchToHttp().getRequest<Peticion>().autenticado,
);

/**
 * RF-008 y 14.1-7: autentica el JWT y autoriza por rol, y se deniega por omisión: una ruta
 * que no declare @Publico ni @Roles no la usa nadie.
 */
@Injectable()
export class AutenticacionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly autenticacion: AutenticacionService,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const objetivos = [contexto.getHandler(), contexto.getClass()];
    if (this.reflector.getAllAndOverride<boolean>('publico', objetivos)) return true;

    const peticion = contexto.switchToHttp().getRequest<Peticion>();
    const [tipo, token] = (peticion.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException();
    peticion.autenticado = await this.autenticacion.validarToken(token);

    const permitidos = this.reflector.getAllAndOverride<ClaveRol[] | undefined>('roles', objetivos) ?? [];
    if (!permitidos.some((rol) => peticion.autenticado?.usuario.roles.includes(rol))) throw new ForbiddenException();
    return true;
  }
}
