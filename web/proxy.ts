import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_SESION, cookieDeSesion, segundosRestantes } from './lib/cookie-sesion';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const RENOVAR_SI_QUEDAN_SEG = 5 * 60;

function aIngresar(peticion: NextRequest, motivo?: string) {
  const destino = new URL('/ingresar', peticion.url);
  if (motivo) destino.searchParams.set('motivo', motivo);
  const respuesta = NextResponse.redirect(destino);
  respuesta.cookies.delete(COOKIE_SESION);
  return respuesta;
}

/** Tabla 38: mientras la persona use el portal, la sesión se renueva sola hasta la sesión máxima que fija la API. */
export async function proxy(peticion: NextRequest) {
  const token = peticion.cookies.get(COOKIE_SESION)?.value;
  if (!token) return aIngresar(peticion);

  const restante = segundosRestantes(token, Math.floor(Date.now() / 1000));
  if (restante <= 0) return aIngresar(peticion, 'sesion');
  if (restante > RENOVAR_SI_QUEDAN_SEG) return NextResponse.next();

  try {
    const renovacion = await fetch(`${API_URL}/sesiones/actual/renovacion`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (renovacion.status === 401) return aIngresar(peticion, 'sesion');
    if (!renovacion.ok) return NextResponse.next();
    const nuevo = (await renovacion.json()) as { token: string; expiraEn: string };
    const respuesta = NextResponse.next();
    respuesta.cookies.set(cookieDeSesion(nuevo.token, nuevo.expiraEn));
    return respuesta;
  } catch {
    return NextResponse.next(); // el token aún vale: la página dirá si la API no responde
  }
}

export const config = { matcher: ['/((?!_next/static|ingresar|salud|icon.svg).*)'] };
