import { beforeEach, describe, expect, it, vi } from 'vitest';
import { consultar, ErrorApi, llamar } from '@/lib/api';

const tarro = vi.hoisted(() => ({ token: 'token-de-prueba' as string | undefined }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => (tarro.token ? { value: tarro.token } : undefined) }),
}));
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw new Error(`REDIRECCION:${destino}`);
  },
}));

const responder = (estado: number, cuerpo?: unknown) =>
  vi.fn(async () => new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status: estado }));

beforeEach(() => {
  tarro.token = 'token-de-prueba';
});

describe('llamar (Tabla 44: autenticacion JWT y codigos de error de negocio)', () => {
  it('manda el token de la cookie y el cuerpo en JSON, sin cache', async () => {
    const espia = responder(200, { ok: true });
    vi.stubGlobal('fetch', espia);
    await expect(llamar('POST', '/facultades', { clave: 'A' })).resolves.toEqual({ ok: true });
    const [url, opciones] = espia.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://localhost:3001/facultades');
    expect(opciones).toMatchObject({
      method: 'POST',
      body: '{"clave":"A"}',
      cache: 'no-store',
      headers: { Authorization: 'Bearer token-de-prueba', 'Content-Type': 'application/json' },
    });
  });

  it('sin cookie no manda Authorization, y sin cuerpo no manda Content-Type', async () => {
    tarro.token = undefined;
    const espia = responder(200, []);
    vi.stubGlobal('fetch', espia);
    await llamar('GET', '/salud');
    const [, opciones] = espia.mock.calls[0] as unknown as [string, RequestInit];
    expect(opciones.headers).toEqual({});
    expect(opciones.body).toBeUndefined();
  });

  it('204 no intenta leer un cuerpo', async () => {
    vi.stubGlobal('fetch', responder(204));
    await expect(llamar('DELETE', '/sesiones/actual')).resolves.toBeUndefined();
  });

  it('un error de la API conserva estado, codigo, mensaje y campos', async () => {
    vi.stubGlobal('fetch', responder(400, { codigo: 'ENTRADA_INVALIDA', mensaje: 'Revisa', campos: ['clave'] }));
    const error = await llamar('POST', '/facultades', {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error).toMatchObject({ estado: 400, codigo: 'ENTRADA_INVALIDA', message: 'Revisa', campos: ['clave'] });
  });
});

describe('consultar', () => {
  it('devuelve los datos', async () => {
    vi.stubGlobal('fetch', responder(200, [1]));
    await expect(consultar('/planes')).resolves.toEqual([1]);
  });

  it.each([
    [401, 'NO_AUTENTICADO', '/ingresar?motivo=sesion'],
    [403, 'SIN_PERMISO', '/sin-permiso'],
  ])('un %i lleva a la pagina que lo explica', async (estado, codigo, destino) => {
    vi.stubGlobal('fetch', responder(estado, { codigo, mensaje: 'x' }));
    await expect(consultar('/usuarios')).rejects.toThrow(`REDIRECCION:${destino}`);
  });

  it('cualquier otro fallo llega a la pagina de error', async () => {
    vi.stubGlobal('fetch', responder(500, { codigo: 'ERROR_INTERNO', mensaje: 'x' }));
    await expect(consultar('/planes')).rejects.toBeInstanceOf(ErrorApi);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('sin red')));
    await expect(consultar('/planes')).rejects.toThrow('sin red');
  });
});
