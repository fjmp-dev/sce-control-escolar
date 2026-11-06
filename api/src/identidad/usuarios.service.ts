import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { BitacoraService, USUARIO_TECNICO } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { PrismaService } from '../persistencia/prisma.service';
import { AutenticacionService, COSTO_BCRYPT } from './autenticacion.service';
import { ClaveRol, Usuario, validarContrasena } from './dominio/usuario';
import { UsuarioRepository } from './usuario.repository';

/** Lo que se muestra y se guarda como valor anterior: nunca el hash ni la versión de sesión. */
export const vistaDe = ({ id, correo, activo, roles }: Usuario) => ({ id, correo, activo, roles: [...roles] });

/** Tablas 11 y 12 con CC-007: altas de usuarios a cargo del administrador, cada una con bitácora. */
@Injectable()
export class UsuariosService {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly autenticacion: AutenticacionService,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  async listar() {
    return (await this.usuarios.listar(USUARIO_TECNICO)).map(vistaDe);
  }

  async alta(autor: Usuario, confirmacion: string, correo: string, contrasena: string, roles: ClaveRol[]) {
    await this.autenticacion.confirmarContrasena(autor, confirmacion);
    validarContrasena(contrasena, correo);
    const hash = await bcrypt.hash(contrasena, COSTO_BCRYPT);
    return this.prisma.transaccion(async () => {
      const creado = await this.usuarios.crear(correo, hash, roles);
      await this.bitacora.registrar({ autor: autor.id, accion: 'alta_usuario', entidad: `usuario:${creado.id}` });
      return vistaDe(creado);
    });
  }

  async cambiar(autor: Usuario, confirmacion: string, id: string, activo?: boolean, roles?: ClaveRol[]) {
    if (activo === undefined && roles === undefined) throw new BadRequestException({ campos: ['activo', 'roles'] });
    await this.autenticacion.confirmarContrasena(autor, confirmacion);
    // Sin esto, el último administrador podría dejar al sistema sin administradores.
    if (id === autor.id) {
      throw new ErrorDeNegocio('AUTOMODIFICACION', 'No puedes cambiar tu propio acceso. Pídelo a otro administrador.');
    }
    const antes = id === USUARIO_TECNICO ? null : await this.usuarios.porId(id);
    if (!antes) throw new NotFoundException();
    return this.prisma.transaccion(async () => {
      const despues = await this.usuarios.cambiarAcceso(id, activo, roles);
      await this.bitacora.registrar({
        autor: autor.id,
        accion: 'cambio_usuario',
        entidad: `usuario:${id}`,
        valorAnterior: vistaDe(antes),
      });
      return vistaDe(despues);
    });
  }
}
