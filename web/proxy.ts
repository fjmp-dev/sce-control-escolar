import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_SESION, cookieDeSesion, segundosRestantes } from './lib/cookie-sesion';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const RENOVAR_SI_QUEDAN_SEG = 5 * 60;
// Sin sesión: el ingreso y el aviso de privacidad (12.6). Llevan la CSP como cualquier otra página.
const PUBLICAS = /^\/(ingresar|privacidad)(\/|$)/;

/**
 * STRIDE, portal (12.2): CSP estricta. Solo corren los scripts con el nonce de esta petición y los que estos cargan
 * ('strict-dynamic'); Next.js lee el nonce de la cabecera de la petición y lo pone en los suyos. Sin 'unsafe-inline'.
 * `next dev` necesita eval y estilos en línea; la imagen de producción, no.
 */
export function politicaDeSeguridad(nonce: string) {
  const desarrollo = process.env.NODE_ENV === 'development';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${desarrollo ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' ${desarrollo ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Solo con HTTPS (staging y piloto): sobre http://localhost, WebKit subiría los recursos a https y fallarían.
    ...(process.env.COOKIE_SEGURA === 'false' ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

function aIngresar(peticion: NextRequest, motivo?: string) {
  const destino = new URL('/ingresar', peticion.url);
  if (motivo) destino.searchParams.set('motivo', motivo);
  const respuesta = NextResponse.redirect(destino);
  respuesta.cookies.delete(COOKIE_SESION);
  return respuesta;
}

/** Tabla 38: mientras la persona use el portal, la sesión se renueva sola hasta la sesión máxima que fija la API. */
async function conSesion(peticion: NextRequest, seguir: () => NextResponse) {
  if (PUBLICAS.test(peticion.nextUrl.pathname)) return seguir();
  const token = peticion.cookies.get(COOKIE_SESION)?.value;
  if (!token) return aIngresar(peticion);

  const restante = segundosRestantes(token, Math.floor(Date.now() / 1000));
  if (restante <= 0) return aIngresar(peticion, 'sesion');
  if (restante > RENOVAR_SI_QUEDAN_SEG) return seguir();

  try {
    const renovacion = await fetch(`${API_URL}/sesiones/actual/renovacion`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (renovacion.status === 401) return aIngresar(peticion, 'sesion');
    if (!renovacion.ok) return seguir();
    const nuevo = (await renovacion.json()) as { token: string; expiraEn: string };
    const respuesta = seguir();
    respuesta.cookies.set(cookieDeSesion(nuevo.token, nuevo.expiraEn));
    return respuesta;
  } catch {
    return seguir(); // el token aún vale: la página dirá si la API no responde
  }
}

/** Un nonce por petición (122 bits aleatorios de un UUID v4), en la respuesta y en la petición que recibe Next.js. */
export async function proxy(peticion: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const politica = politicaDeSeguridad(nonce);
  const cabeceras = new Headers(peticion.headers);
  cabeceras.set('x-nonce', nonce);
  cabeceras.set('Content-Security-Policy', politica);
  const respuesta = await conSesion(peticion, () => NextResponse.next({ request: { headers: cabeceras } }));
  respuesta.headers.set('Content-Security-Policy', politica);
  return respuesta;
}

// Toda página lleva la CSP. Quedan fuera la salud, que es JSON, y los estáticos.
export const config = { matcher: ['/((?!_next/static|_next/image|salud|icon.svg).*)'] };
