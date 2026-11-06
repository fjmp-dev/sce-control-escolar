import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Publico } from '../identidad/autenticacion.guard';
import { PrismaService } from '../persistencia/prisma.service';
import { ApiErrores } from './validacion';

class SaludRespuesta {
  @ApiProperty({ example: 'ok' }) estado!: string;
}

/** Fig. 9 y Tabla 57. Anónimo porque lo sondea un monitor externo; no expone versión ni detalle. */
@ApiTags('Salud')
@Controller('salud')
export class SaludController {
  constructor(private readonly prisma: PrismaService) {}

  @Publico()
  @Get()
  @ApiResponse({ status: 200, type: SaludRespuesta })
  @ApiErrores(503)
  async salud(): Promise<SaludRespuesta> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException();
    }
    return { estado: 'ok' };
  }
}
