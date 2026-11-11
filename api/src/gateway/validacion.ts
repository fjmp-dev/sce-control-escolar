import { applyDecorators, BadRequestException, ValidationPipe } from '@nestjs/common';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';

/** Formato de todo error de la API (Tabla 28). */
export class ErrorRespuesta {
  @ApiProperty({ example: 'ENTRADA_INVALIDA' }) codigo!: string;
  @ApiProperty() mensaje!: string;
  @ApiProperty({ type: [String], required: false }) campos?: string[];
}

export const ApiErrores = (...estados: number[]) =>
  applyDecorators(...estados.map((status) => ApiResponse({ status, type: ErrorRespuesta })));

const SIN_CARACTERES_DE_CONTROL = /^\P{Cc}+$/u;

/** 14.3: validación declarativa. Se rechazan los caracteres de control, que PostgreSQL no acepta en texto. */
export const Texto = (maximo = 200) =>
  applyDecorators(
    ApiProperty({ maxLength: maximo }),
    IsString(),
    MaxLength(maximo),
    Matches(SIN_CARACTERES_DE_CONTROL),
  );

/** Clave de catálogo: alfanumérica con guion, como `ISW-101` (D-11). Viaja en URL y en bitácora. */
export const Clave = () =>
  applyDecorators(
    ApiProperty({ maxLength: 20, pattern: '^[A-Za-z0-9][A-Za-z0-9-]*$', example: 'ISW-101' }),
    IsString(),
    MaxLength(20),
    Matches(/^[A-Za-z0-9][A-Za-z0-9-]*$/),
  );

/** Clave de periodo: año y semestre, como `2027A` (D-11). */
export const ClaveDePeriodo = () =>
  applyDecorators(
    ApiProperty({ example: '2027A', pattern: String.raw`^\d{4}[AB]$` }),
    IsString(),
    Matches(/^\d{4}[AB]$/),
  );

/** `/…/{clave}` de un periodo. Lo comparten académico, expediente y reportes, que no dependen entre sí (Fig. 2). */
export class PeriodoParam {
  @ClaveDePeriodo() clave!: string;
}

/** Matrícula: de 7 a 10 dígitos (D-11, provisional hasta ratificarla con el catálogo institucional). */
export const Matricula = () =>
  applyDecorators(
    ApiProperty({ pattern: String.raw`^\d{7,10}$`, example: '2420001' }),
    IsString(),
    Matches(/^\d{7,10}$/),
  );

/** En minúsculas, para que `Ana@` y `ana@` no sean dos cuentas. */
export const Correo = (requerido = true) =>
  applyDecorators(
    ApiProperty({ format: 'email', required: requerido }),
    IsEmail(),
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.toLowerCase() : value)),
  );

/** Se responde qué campos revisar, no los mensajes de class-validator, que vienen en inglés. */
export const validacionDeEntrada = () =>
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errores) => new BadRequestException({ campos: errores.map((e) => e.property) }),
  });
