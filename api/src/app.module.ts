import { ArgumentsHost, Catch, ConflictException, BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE, BaseExceptionFilter } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { CatalogosController } from './catalogos/catalogos.controller';
import { PrismaService } from './prisma.service';

if (!process.env.JWT_SECRET) throw new Error('Falta JWT_SECRET en el ambiente (manual sec. 14.1, regla 5)');

/** Errores de integridad de la base como 409/400 en lugar de 500. */
@Catch(Prisma.PrismaClientKnownRequestError)
class PrismaErrorFilter extends BaseExceptionFilter {
  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    if (e.code === 'P2002') return super.catch(new ConflictException('El registro ya existe'), host);
    if (e.code === 'P2003') return super.catch(new BadRequestException('Referencia a un registro inexistente'), host);
    super.catch(e, host);
  }
}

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as `${number}h` },
    }),
  ],
  controllers: [AuthController, CatalogosController],
  providers: [
    PrismaService,
    // Guard global: todo endpoint exige token salvo @Publico() (sec. 14.1, regla 7: se deniega por omision).
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }) },
    { provide: APP_FILTER, useClass: PrismaErrorFilter },
  ],
})
export class AppModule {}
