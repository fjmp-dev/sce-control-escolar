import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { ArrayNotEmpty, ArrayUnique, IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ClaveRol, Roles, UsuarioSesion } from '../auth/auth.guard';
import { PrismaService } from '../prisma.service';

// Alta, baja y cambio de rol de usuarios (plan de trabajo #22). Solo control escolar,
// que administra expedientes (Tabla 5). Cada operacion deja fila en bitacora con
// autor y valor anterior (RNF-SEG-001; Parte B del plan de auditoria: cambios de rol y bajas).

const CLAVES: ClaveRol[] = ['alumno', 'profesor', 'control_escolar', 'coordinacion', 'caja', 'direccion'];
const SELECCION = { id: true, correo: true, activo: true, roles: { select: { rol: { select: { clave: true } } } } };

class AltaUsuarioDto {
  @IsEmail() correo: string;
  @IsString() @MinLength(12) contrasena: string;
  @ArrayNotEmpty() @ArrayUnique() @IsIn(CLAVES, { each: true }) roles: ClaveRol[];
}

class CambioUsuarioDto {
  @IsOptional() @IsBoolean() activo?: boolean;
  @IsOptional() @ArrayNotEmpty() @ArrayUnique() @IsIn(CLAVES, { each: true }) roles?: ClaveRol[];
}

type Fila = { id: string; correo: string; activo: boolean; roles: { rol: { clave: string } }[] };
const plano = ({ roles, ...u }: Fila) => ({ ...u, roles: roles.map((r) => r.rol.clave) });

@Roles('control_escolar')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly prisma: PrismaService) {}

  private async idsDeRoles(claves: ClaveRol[]) {
    return (await this.prisma.rol.findMany({ where: { clave: { in: claves } }, select: { id: true } })).map((r) => ({
      rolId: r.id,
    }));
  }

  @Get()
  async listar() {
    return (await this.prisma.usuario.findMany({ select: SELECCION, orderBy: { correo: 'asc' } })).map(plano);
  }

  @Post()
  async alta(@Body() { correo, contrasena, roles }: AltaUsuarioDto, @Req() req: { usuario: UsuarioSesion }) {
    const hashContrasena = await bcrypt.hash(contrasena, 10);
    const creados = await this.idsDeRoles(roles);
    return this.prisma.$transaction(async (tx) => {
      const u = await tx.usuario.create({ data: { correo, hashContrasena, roles: { create: creados } }, select: SELECCION });
      await tx.bitacora.create({ data: { autor: req.usuario.id, accion: 'alta_usuario', entidad: `usuario:${u.id}` } });
      return plano(u);
    });
  }

  @Patch(':id')
  async cambiar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { activo, roles }: CambioUsuarioDto,
    @Req() req: { usuario: UsuarioSesion },
  ) {
    const antes = await this.prisma.usuario.findUnique({ where: { id }, select: SELECCION });
    if (!antes) throw new NotFoundException();
    const nuevos = roles && (await this.idsDeRoles(roles));
    return this.prisma.$transaction(async (tx) => {
      const u = await tx.usuario.update({
        where: { id },
        data: { activo, roles: nuevos && { deleteMany: {}, create: nuevos } },
        select: SELECCION,
      });
      await tx.bitacora.create({
        data: { autor: req.usuario.id, accion: 'cambio_usuario', entidad: `usuario:${id}`, valorAnterior: plano(antes) },
      });
      return plano(u);
    });
  }
}
