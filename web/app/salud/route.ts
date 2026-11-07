/** Tabla 57 y Fig. 9: healthcheck de la web, para el monitor externo. Sin detalle. */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ estado: 'ok' });
}
