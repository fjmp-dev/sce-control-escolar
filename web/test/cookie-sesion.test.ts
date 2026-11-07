import { afterEach, describe, expect, it, vi } from 'vitest';
import { cookieDeSesion, segundosRestantes } from '@/lib/cookie-sesion';

const jwt = (carga: object) => `x.${Buffer.from(JSON.stringify(carga)).toString('base64url')}.y`;

afterEach(() => vi.unstubAllEnvs());

describe('cookieDeSesion (CC-014)', () => {
  it('es httpOnly, y Secure salvo que el ambiente sin HTTPS lo apague', () => {
    const cookie = cookieDeSesion('t', '2030-01-01T00:00:00.000Z');
    expect(cookie).toMatchObject({ value: 't', httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
    expect(cookie.expires.toISOString()).toBe('2030-01-01T00:00:00.000Z');
    vi.stubEnv('COOKIE_SEGURA', 'false');
    expect(cookieDeSesion('t', '2030-01-01T00:00:00.000Z').secure).toBe(false);
  });
});

describe('segundosRestantes', () => {
  it('calcula lo que le queda al token', () => {
    expect(segundosRestantes(jwt({ exp: 1100 }), 1000)).toBe(100);
    expect(segundosRestantes(jwt({ exp: 900 }), 1000)).toBe(-100);
  });

  it.each(['basura', 'a.b.c', jwt({}), jwt({ exp: 'mañana' })])('un token ilegible vale 0: %s', (token) => {
    expect(segundosRestantes(token, 1000)).toBe(0);
  });
});
