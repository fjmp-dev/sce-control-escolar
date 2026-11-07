export const COOKIE_SESION = 'sce_sesion';

/** El JWT vive en una cookie httpOnly: el navegador nunca lo lee (CC-014). */
export const cookieDeSesion = (token: string, expiraEn: string) => ({
  name: COOKIE_SESION,
  value: token,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.COOKIE_SEGURA !== 'false',
  path: '/',
  expires: new Date(expiraEn),
});

/** Solo para decidir cuándo renovar: quien valida el token es la API. Un token ilegible vale 0. */
export function segundosRestantes(token: string, ahoraSeg: number): number {
  try {
    const { exp } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as { exp?: unknown };
    return typeof exp === 'number' ? exp - ahoraSeg : 0;
  } catch {
    return 0;
  }
}
