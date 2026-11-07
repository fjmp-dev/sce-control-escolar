import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { Esquemas } from './contrato';
import { COOKIE_SESION } from './cookie-sesion';

export const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const ESPERA_MAXIMA_MS = 10_000;

export class ErrorApi extends Error {
  constructor(
    readonly estado: number,
    readonly codigo: string,
    mensaje: string,
    readonly campos: string[] = [],
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
  }
}

/** Fig. 9 y CC-014: el servidor de Next.js llama a la API con el token de la cookie. */
export async function llamar<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    cache: 'no-store',
    signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
  });
  if (respuesta.status === 204) return undefined as T;
  const datos: unknown = await respuesta.json();
  if (respuesta.ok) return datos as T;
  const { codigo, mensaje, campos } = datos as Esquemas['ErrorRespuesta'];
  throw new ErrorApi(respuesta.status, codigo, mensaje, campos);
}

/** Lectura para una página: sin sesión lleva a ingresar; sin permiso, a una página que lo explica. */
export async function consultar<T>(ruta: string): Promise<T> {
  try {
    return await llamar<T>('GET', ruta);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 401) redirect('/ingresar?motivo=sesion');
    if (error instanceof ErrorApi && error.estado === 403) redirect('/sin-permiso');
    throw error;
  }
}

/** Una sola consulta por render, aunque la pidan el layout y la página. */
export const sesionActual = cache(() => consultar<Esquemas['SesionRespuesta']>('/sesiones/actual'));
