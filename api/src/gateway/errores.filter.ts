import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { CodigoDeNegocio, ErrorDeNegocio } from '../dominio/error-de-negocio';
import { ErrorRespuesta } from './validacion';

const ESTADO_DE: Record<CodigoDeNegocio, number> = {
  CREDENCIALES_INVALIDAS: 401,
  SESION_VENCIDA: 401,
  CONTRASENA_DEBIL: 400,
  REAUTENTICACION_FALLIDA: 403,
  AUTOMODIFICACION: 409,
  PRERREQUISITO_CIRCULAR: 409,
};

const POR_ESTADO: Record<number, [codigo: string, mensaje: string]> = {
  400: ['ENTRADA_INVALIDA', 'Revisa los datos enviados.'],
  401: ['NO_AUTENTICADO', 'Inicia sesión para continuar.'],
  403: ['SIN_PERMISO', 'Tu rol no permite esta operación.'],
  404: ['NO_ENCONTRADO', 'El recurso no existe.'],
  409: ['YA_EXISTE', 'Ya existe un registro con esos datos. Cambia la clave o el correo.'],
  503: ['SERVICIO_NO_DISPONIBLE', 'El servicio no está disponible por ahora.'],
};

const POR_CODIGO_PRISMA: Record<string, [estado: number, codigo?: string, mensaje?: string]> = {
  P2000: [400],
  P2002: [409],
  P2003: [400, 'REFERENCIA_INEXISTENTE', 'Se hace referencia a un registro que no existe. Elige uno de la lista.'],
  P2025: [404],
};

const interno = (): [number, ErrorRespuesta] => [
  500,
  { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error interno. Intenta de nuevo más tarde.' },
];

function porEstado(estado: number, extra?: Partial<ErrorRespuesta>): [number, ErrorRespuesta] {
  const [codigo, mensaje] = POR_ESTADO[estado] ?? POR_ESTADO[400];
  return [estado, { codigo, mensaje, ...extra }];
}

function traducir(error: unknown): [number, ErrorRespuesta] {
  if (error instanceof ErrorDeNegocio) {
    return [ESTADO_DE[error.codigo], { codigo: error.codigo, mensaje: error.message }];
  }
  if (error instanceof HttpException) {
    const { campos } = error.getResponse() as { campos?: string[] };
    const estado = error.getStatus();
    const mensaje = campos && `Revisa estos campos: ${campos.join(', ')}.`;
    return estado >= 500 && estado !== 503 ? interno() : porEstado(estado, campos && { campos, mensaje });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && POR_CODIGO_PRISMA[error.code]) {
    const [estado, codigo, mensaje] = POR_CODIGO_PRISMA[error.code];
    return porEstado(estado, codigo ? { codigo, mensaje } : {});
  }
  // Las restricciones CHECK de la base son la última línea de validación: dato inválido, no fallo del servidor.
  if (error instanceof Prisma.PrismaClientUnknownRequestError && error.message.includes('check constraint')) {
    return porEstado(400);
  }
  // JSON mal formado o cuerpo demasiado grande: errores de cliente del lector del cuerpo, sin eco de lo enviado.
  const estado = (error as { statusCode?: number } | null)?.statusCode;
  return estado && estado >= 400 && estado < 500 ? porEstado(400) : interno();
}

/** Solo nombre, código y marcos de pila: el mensaje de Prisma incluye los valores de la consulta (Tabla 57). */
function resumenSinDatos(error: unknown) {
  const { name, code, stack } = error as { name?: string; code?: string; stack?: string };
  const pila = stack?.split('\n').filter((linea) => linea.trim().startsWith('at '));
  return { error: name, codigoError: code, pila };
}

/** Tabla 28: códigos de error de negocio. Nunca sale una traza ni un detalle interno al cliente (CS-SEG-05). */
@Catch()
export class ErroresFilter implements ExceptionFilter {
  private readonly log = new Logger('Errores');

  catch(error: unknown, host: ArgumentsHost) {
    const respuesta = host.switchToHttp().getResponse<Response>();
    const [estado, cuerpo] = traducir(error);
    if (estado >= 500) this.log.error(resumenSinDatos(error));
    respuesta.locals.codigo = cuerpo.codigo;
    respuesta.status(estado).json(cuerpo);
  }
}
