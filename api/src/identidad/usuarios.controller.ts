import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsBoolean, IsIn, IsOptional } from 'class-validator';
import { ApiErrores, Correo, Texto } from '../gateway/validacion';
import { Actual, Roles } from './autenticacion.guard';
import { Autenticado, AutenticacionService } from './autenticacion.service';
import { ClaveRol, ROLES } from './dominio/usuario';
import { UsuariosService } from './usuarios.service';

class AltaUsuarioDto {
  @Texto(200) confirmacion!: string;
  @Correo() correo!: string;
  @Texto(200) contrasena!: string;
  @ApiProperty({ enum: ROLES, isArray: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(ROLES, { each: true })
  roles!: ClaveRol[];
}

class CambioUsuarioDto {
  @Texto(200) confirmacion!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() activo?: boolean;
  @ApiProperty({ enum: ROLES, isArray: true, required: false })
  @IsOptional()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(ROLES, { each: true })
  roles?: ClaveRol[];
}

class CambioContrasenaDto {
  @Texto(200) actual!: string;
  @Texto(200) nueva!: string;
}

class UsuarioRespuesta {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'email' }) correo!: string;
  @ApiProperty() activo!: boolean;
  @ApiProperty({ enum: ROLES, isArray: true }) roles!: string[];
}

@ApiTags('Usuarios')
@ApiErrores(401, 403)
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly autenticacion: AutenticacionService,
  ) {}

  @Roles('administrador')
  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiResponse({ status: 200, type: [UsuarioRespuesta] })
  listar() {
    return this.usuarios.listar();
  }

  @Roles('administrador')
  @Post()
  @ApiOperation({ summary: 'Dar de alta un usuario; pide confirmar la contraseña del administrador' })
  @ApiResponse({ status: 201, type: UsuarioRespuesta })
  @ApiErrores(400, 409)
  alta(@Body() d: AltaUsuarioDto, @Actual() { usuario }: Autenticado) {
    return this.usuarios.alta(usuario, d.confirmacion, d.correo, d.contrasena, d.roles);
  }

  @Roles('administrador')
  @Patch(':id')
  @ApiOperation({ summary: 'Dar de baja o cambiar roles; revoca las sesiones del usuario' })
  @ApiResponse({ status: 200, type: UsuarioRespuesta })
  @ApiErrores(400, 404, 409)
  cambiar(@Param('id', ParseUUIDPipe) id: string, @Body() d: CambioUsuarioDto, @Actual() { usuario }: Autenticado) {
    return this.usuarios.cambiar(usuario, d.confirmacion, id, d.activo, d.roles);
  }

  @Roles(...ROLES)
  @Put('actual/contrasena')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cambiar la contraseña propia; revoca las sesiones de la cuenta' })
  @ApiResponse({ status: 204 })
  @ApiErrores(400)
  cambiarContrasena(@Body() d: CambioContrasenaDto, @Actual() { usuario }: Autenticado) {
    return this.autenticacion.cambiarContrasena(usuario, d.actual, d.nueva);
  }
}
