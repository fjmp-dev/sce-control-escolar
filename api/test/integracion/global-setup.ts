// Base para las pruebas de integracion: efimera, migrada y con el seed sintetico. No toca la base local.
import { execFileSync } from 'node:child_process';
import { postgres, prisma, urlDe } from './postgres';

export default async function () {
  const pg = await postgres();
  const url = urlDe(pg);
  prisma(url, 'migrate', 'deploy');
  execFileSync('node', ['prisma/seed.mts'], { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
  process.env.DATABASE_URL = url;
  process.env.JWT_SECRET = 'solo-para-pruebas-no-es-un-secreto';
  (globalThis as { pgDePruebas?: typeof pg }).pgDePruebas = pg;
}
