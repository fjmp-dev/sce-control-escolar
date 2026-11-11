import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { config, politicaDeSeguridad, proxy } from '@/proxy';

const ahora = () => Math.floor(Date.now() / 1000);
const jwt = (segundos: number) =>
  `x.${Buffer.from(JSON.stringify({ exp: ahora() + segundos })).toString('base64url')}.y`;
const peticion = (token?: string) =>
  new NextRequest('http://localhost:3000/facultades', { headers: token ? { cookie: `sce_sesion=${token}` } : {} });
const siguio = (r: Response) => r.headers.get('x-middleware-next') === '1';

describe('proxy (Tabla 38, renovacion controlada)', () => {
  it('pasa por toda pagina; solo quedan fuera la salud y los estaticos', () => {
    const pasa = new RegExp(`^${config.matcher[0]}$`);
    for (const ruta of ['/salud', '/icon.svg', '/_next/static/chunks/a.js']) {
      expect(pasa.test(ruta), ruta).toBe(false);
    }
    for (const ruta of ['/', '/ingresar', '/privacidad', '/facultades', '/mi-expediente', '/usuarios']) {
      expect(pasa.test(ruta), ruta).toBe(true);
    }
  });

  it('sin sesion solo pasan el ingreso y el aviso de privacidad', async () => {
    for (const ruta of ['/ingresar', '/ingresar?motivo=sesion', '/privacidad']) {
      expect(siguio(await proxy(new NextRequest(`http://localhost:3000${ruta}`))), ruta).toBe(true);
    }
    expect(siguio(await proxy(new NextRequest('http://localhost:3000/ingresar-falso')))).toBe(false);
  });

  it('sin cookie lleva a ingresar, sin motivo', async () => {
    const r = await proxy(peticion());
    expect(r.headers.get('location')).toBe('http://localhost:3000/ingresar');
  });

  it('con el token vencido lleva a ingresar, explica el motivo y borra la cookie', async () => {
    const r = await proxy(peticion(jwt(-10)));
    expect(r.headers.get('location')).toBe('http://localhost:3000/ingresar?motivo=sesion');
    expect(r.headers.get('set-cookie')).toContain('sce_sesion=;');
  });

  it('con tiempo de sobra no llama a la API', async () => {
    const espia = vi.fn();
    vi.stubGlobal('fetch', espia);
    expect(siguio(await proxy(peticion(jwt(3000))))).toBe(true);
    expect(espia).not.toHaveBeenCalled();
  });

  it('por vencer renueva con la API y actualiza la cookie httpOnly', async () => {
    const viejo = jwt(100);
    const espia = vi.fn(async () => Response.json({ token: 'nuevo', expiraEn: '2030-01-01T00:00:00.000Z' }));
    vi.stubGlobal('fetch', espia);
    const r = await proxy(peticion(viejo));
    const [url, opciones] = espia.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://localhost:3001/sesiones/actual/renovacion');
    expect(opciones.headers).toEqual({ Authorization: `Bearer ${viejo}` });
    expect(siguio(r)).toBe(true);
    expect(r.headers.get('set-cookie')).toMatch(/sce_sesion=nuevo;.*HttpOnly/i);
  });

  it('si la API ya no renueva (sesion maxima o revocada) lleva a ingresar', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 })),
    );
    const r = await proxy(peticion(jwt(100)));
    expect(r.headers.get('location')).toBe('http://localhost:3000/ingresar?motivo=sesion');
  });

  it('si la API falla, el token aun vale y la peticion sigue', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 500 })),
    );
    expect(siguio(await proxy(peticion(jwt(100))))).toBe(true);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('sin red')));
    expect(siguio(await proxy(peticion(jwt(100))))).toBe(true);
  });
});

describe('proxy (12.2, CSP con nonce)', () => {
  const nonceDe = (r: Response) =>
    /'nonce-([A-Za-z0-9+/=]+)'/.exec(r.headers.get('content-security-policy') ?? '')?.[1];

  it('cada respuesta trae su propio nonce, sin unsafe-inline, y Next.js lo recibe en la peticion', async () => {
    const [a, b] = [await proxy(peticion(jwt(3000))), await proxy(new NextRequest('http://localhost:3000/ingresar'))];
    const csp = a.headers.get('content-security-policy') ?? '';
    expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'(;|$)/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain('unsafe-inline');
    expect(nonceDe(a)).toHaveLength(48); // base64 de los 36 caracteres del UUID
    expect(nonceDe(a)).not.toBe(nonceDe(b));
    expect(a.headers.get('x-middleware-request-x-nonce')).toBe(nonceDe(a));
    expect(a.headers.get('x-middleware-request-content-security-policy')).toBe(csp);
  });

  it('tambien la lleva la redireccion a ingresar', async () => {
    const r = await proxy(peticion());
    expect(r.headers.get('location')).toBe('http://localhost:3000/ingresar');
    expect(nonceDe(r)).toBeTruthy();
  });

  it('upgrade-insecure-requests solo con HTTPS: el ambiente local declara COOKIE_SEGURA=false', () => {
    expect(politicaDeSeguridad('n')).toContain('upgrade-insecure-requests');
    vi.stubEnv('COOKIE_SEGURA', 'false');
    expect(politicaDeSeguridad('n')).not.toContain('upgrade-insecure-requests');
    vi.unstubAllEnvs();
  });
});
