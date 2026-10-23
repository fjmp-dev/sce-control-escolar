import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { IsEmail, IsString } from 'class-validator';
import { PrismaService } from '../prisma.service';
import { Publico, UsuarioSesion } from './auth.guard';

class LoginDto {
  @IsEmail() correo: string;
  @IsString() contrasena: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  @Publico()
  @Post('login')
  @HttpCode(200)
  async login(@Body() { correo, contrasena }: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { correo } });
    // Mismo error para correo inexistente y contrasena incorrecta: no revela que cuentas existen.
    if (!usuario?.activo || !(await bcrypt.compare(contrasena, usuario.hashContrasena))) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    return { accessToken: await this.jwt.signAsync({ sub: usuario.id }) };
  }

  @Get('yo')
  yo(@Req() req: { usuario: UsuarioSesion }) {
    return req.usuario;
  }
}
