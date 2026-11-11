import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistencia/prisma.service';
import { ClaveRol, Usuario } from './dominio/usuario';

const CON_ROLES = { roles: { select: { rol: { select: { clave: true } } } } };

interface Fila {
  id: string;
  correo: string;
  hashContrasena: string;
  activo: boolean;
  sesionVersion: number;
  roles: { rol: { clave: string } }[];
}

const aDominio = (f: Fila) =>
  new Usuario(
    f.id,
    f.correo,
    f.hashContrasena,
    f.activo,
    f.sesionVersion,
    f.roles.map((r) => r.rol.clave as ClaveRol),
  );

/** 14.3: aísla Prisma del dominio. */
@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async porCorreo(correo: string): Promise<Usuario | null> {
    const fila = await this.prisma.cliente().usuario.findUnique({ where: { correo }, include: CON_ROLES });
    return fila && aDominio(fila);
  }

  correos(ids: readonly string[]) {
    return this.prisma
      .cliente()
      .usuario.findMany({ where: { id: { in: [...ids] } }, select: { id: true, correo: true } });
  }

  async porId(id: string): Promise<Usuario | null> {
    const fila = await this.prisma.cliente().usuario.findUnique({ where: { id }, include: CON_ROLES });
    return fila && aDominio(fila);
  }

  async listar(excepto: string): Promise<Usuario[]> {
    const filas = await this.prisma.cliente().usuario.findMany({
      where: { id: { not: excepto } },
      include: CON_ROLES,
      orderBy: { correo: 'asc' },
    });
    return filas.map(aDominio);
  }

  async crear(correo: string, hashContrasena: string, roles: readonly ClaveRol[]): Promise<Usuario> {
    const fila = await this.prisma.cliente().usuario.create({
      data: { correo, hashContrasena, roles: { create: await this.idsDeRoles(roles) } },
      include: CON_ROLES,
    });
    return aDominio(fila);
  }

  /** Un cambio de privilegios invalida las sesiones: reactivar una cuenta no revive sus tokens anteriores. */
  async cambiarAcceso(id: string, activo?: boolean, roles?: readonly ClaveRol[]): Promise<Usuario> {
    const nuevos = roles && { deleteMany: {}, create: await this.idsDeRoles(roles) };
    const fila = await this.prisma.cliente().usuario.update({
      where: { id },
      data: { activo, roles: nuevos, sesionVersion: { increment: 1 } },
      include: CON_ROLES,
    });
    return aDominio(fila);
  }

  async revocarSesiones(id: string): Promise<void> {
    await this.prisma.cliente().usuario.update({ where: { id }, data: { sesionVersion: { increment: 1 } } });
  }

  async cambiarContrasena(id: string, hashContrasena: string): Promise<void> {
    await this.prisma.cliente().usuario.update({
      where: { id },
      data: { hashContrasena, sesionVersion: { increment: 1 } },
    });
  }

  private async idsDeRoles(claves: readonly ClaveRol[]) {
    const filas = await this.prisma.cliente().rol.findMany({
      where: { clave: { in: [...claves] } },
      select: { id: true },
    });
    return filas.map((r) => ({ rolId: r.id }));
  }
}
