import { Body, Controller, Delete, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrores, Correo, Texto } from '../gateway/validacion';
import { Actual, Publico, Roles } from './autenticacion.guard';
import { Autenticado, AutenticacionService } from './autenticacion.service';
import { ROLES } from './dominio/usuario';

class CredencialesDto {
  @Correo() correo!: string;
  @Texto(200) contrasena!: string;
}

class TokenRespuesta {
  @ApiProperty() token!: string;
  @ApiProperty({ format: 'date-time' }) expiraEn!: string;
}

class SesionRespuesta {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'email' }) correo!: string;
  @ApiProperty({ enum: ROLES, isArray: true }) roles!: string[];
}

/** RF-008 y Tabla 38. Las rutas son sustantivos en plural con verbos HTTP (Tabla 31). */
@ApiTags('Sesiones')
@Controller('sesiones')
export class SesionesController {
  constructor(private readonly autenticacion: AutenticacionService) {}

  @Publico()
  @Post()
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 201, type: TokenRespuesta })
  @ApiErrores(400, 401)
  iniciar(@Body() { correo, contrasena }: CredencialesDto) {
    return this.autenticacion.iniciarSesion(correo, contrasena);
  }

  @Roles(...ROLES)
  @Get('actual')
  @ApiOperation({ summary: 'Consultar la sesión actual' })
  @ApiResponse({ status: 200, type: SesionRespuesta })
  @ApiErrores(401, 403)
  actual(@Actual() { usuario: { id, correo, roles } }: Autenticado): SesionRespuesta {
    return { id, correo, roles: [...roles] };
  }

  @Roles(...ROLES)
  @Post('actual/renovacion')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar el token, sin rebasar la sesión máxima' })
  @ApiResponse({ status: 200, type: TokenRespuesta })
  @ApiErrores(401, 403)
  renovar(@Actual() autenticado: Autenticado) {
    return this.autenticacion.renovar(autenticado);
  }

  @Roles(...ROLES)
  @Delete('actual')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cerrar sesión y revocar los tokens de la cuenta' })
  @ApiResponse({ status: 204 })
  @ApiErrores(401, 403)
  cerrar(@Actual() { usuario }: Autenticado) {
    return this.autenticacion.cerrarSesion(usuario);
  }
}
