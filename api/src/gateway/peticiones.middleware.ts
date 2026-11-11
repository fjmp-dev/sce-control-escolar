import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Autenticado } from '../identidad/autenticacion.service';
import { duracion, erroresDeNegocio } from './metricas';

type Peticion = Request & { autenticado?: Autenticado };

/**
 * Tabla 57: registro estructurado para la tasa de errores 5xx y de negocio, sin datos sensibles:
 * ni cuerpo, ni cabeceras, ni URL real. La ruta es la plantilla, así que no lleva identificadores.
 */
@Injectable()
export class PeticionesMiddleware implements NestMiddleware {
  private readonly log = new Logger('Peticiones');

  use(peticion: Peticion, respuesta: Response, siguiente: NextFunction) {
    const inicio = performance.now();
    respuesta.removeHeader('X-Powered-By');
    respuesta.setHeader('X-Content-Type-Options', 'nosniff');
    respuesta.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    respuesta.setHeader('Cache-Control', 'no-store'); // las respuestas llevan tokens y datos personales
    respuesta.on('finish', () => {
      const ms = performance.now() - inicio;
      const ruta = (peticion.route as { path?: string } | undefined)?.path ?? 'sin_ruta';
      const codigo = (respuesta.locals.codigo as string | undefined) ?? null;
      duracion.observe({ metodo: peticion.method, ruta, estado: respuesta.statusCode }, ms / 1000);
      if (codigo) erroresDeNegocio.inc({ codigo });
      this.log.log({
        metodo: peticion.method,
        ruta,
        estado: respuesta.statusCode,
        ms: Math.round(ms),
        usuario: peticion.autenticado?.usuario.id ?? null,
        codigo,
      });
    });
    siguiente();
  }
}
