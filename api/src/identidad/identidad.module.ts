import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { AutenticacionGuard } from './autenticacion.guard';
import { AutenticacionService } from './autenticacion.service';
import { SesionesController } from './sesiones.controller';
import { UsuarioRepository } from './usuario.repository';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

const LONGITUD_MINIMA_DEL_SECRETO = 32; // RFC 7518: HS256 pide al menos 256 bits

function secretoDelAmbiente() {
  const secreto = process.env.JWT_SECRET;
  if (!secreto || secreto.length < LONGITUD_MINIMA_DEL_SECRETO) {
    throw new Error(
      `JWT_SECRET debe venir del ambiente, con al menos ${LONGITUD_MINIMA_DEL_SECRETO} caracteres (14.1-5)`,
    );
  }
  return { secret: secreto, verifyOptions: { algorithms: ['HS256' as const] } };
}

@Module({
  imports: [BitacoraModule, JwtModule.registerAsync({ useFactory: secretoDelAmbiente })],
  controllers: [SesionesController, UsuariosController],
  providers: [
    AutenticacionService,
    UsuariosService,
    UsuarioRepository,
    // Global: toda ruta pasa por aquí (14.1-7).
    { provide: APP_GUARD, useClass: AutenticacionGuard },
  ],
  exports: [UsuariosService],
})
export class IdentidadModule {}
