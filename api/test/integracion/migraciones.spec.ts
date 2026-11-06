// CI-MIG-01 (Tabla 45): las migraciones se aplican sobre una base limpia y sobre una base con datos, sin perdida.
import { cpSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { postgres, prisma, urlDe } from './postgres';

jest.setTimeout(240_000);

const BASE = '20261023001637_init';
const MIGRACIONES = 'prisma/migrations';

type Huellas = Record<string, { columnas: string[]; filas: number; huella: string }>;

// Compara solo las columnas que existian antes de migrar: una columna nueva no es perdida; una borrada, si.
async function huellas(db: PrismaClient, antes?: Huellas): Promise<Huellas> {
  const columnas = await db.$queryRaw<{ tabla: string; columna: string }[]>`
    SELECT table_name AS tabla, column_name AS columna FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'
     ORDER BY table_name, ordinal_position`;
  const resultado: Huellas = {};
  for (const tabla of new Set(columnas.map((c) => c.tabla))) {
    const propias = antes ? antes[tabla]?.columnas : columnas.filter((c) => c.tabla === tabla).map((c) => c.columna);
    if (!propias) continue; // tabla creada por una migracion posterior
    const lista = propias.map((c) => `"${c}"`).join(', ');
    const [{ filas, huella }] = await db.$queryRawUnsafe<{ filas: number; huella: string }[]>(
      `SELECT count(*)::int AS filas, md5(coalesce(string_agg(f, '|' ORDER BY f), '')) AS huella
         FROM (SELECT ROW(${lista})::text AS f FROM "${tabla}") t`,
    );
    resultado[tabla] = { columnas: propias, filas, huella };
  }
  return resultado;
}

describe('CI-MIG-01', () => {
  it('base limpia: se aplican todas, sin pendientes y el esquema coincide con schema.prisma', async () => {
    const pg = await postgres();
    try {
      const url = urlDe(pg);
      prisma(url, 'migrate', 'deploy');
      expect(prisma(url, 'migrate', 'status')).toMatch(/up to date/i);
      // --exit-code falla si la base y el esquema difieren (AU-08).
      prisma(url, 'migrate', 'diff', '--from-url', url, '--to-schema-datamodel', 'prisma/schema.prisma', '--exit-code');
    } finally {
      await pg.stop();
    }
  });

  it('base con datos: las migraciones posteriores a la inicial no pierden ni alteran informacion', async () => {
    const pg = await postgres();
    const parcial = mkdtempSync(join(tmpdir(), 'sce-ci-mig-'));
    const url = urlDe(pg);
    const db = new PrismaClient({ datasourceUrl: url });
    try {
      // Solo la migracion inicial, y datos sobre ese esquema.
      cpSync('prisma/schema.prisma', join(parcial, 'schema.prisma'));
      cpSync(join(MIGRACIONES, 'migration_lock.toml'), join(parcial, 'migrations/migration_lock.toml'));
      cpSync(join(MIGRACIONES, BASE), join(parcial, 'migrations', BASE), { recursive: true });
      prisma(url, 'migrate', 'deploy', '--schema', join(parcial, 'schema.prisma'));
      prisma(url, 'db', 'execute', '--url', url, '--file', 'test/integracion/datos-base-init.sql');

      const antes = await huellas(db);
      expect(Object.keys(antes)).toHaveLength(21);
      expect(Object.entries(antes).filter(([, h]) => h.filas === 0)).toEqual([]);

      // El resto de las migraciones, sobre esos datos.
      const posteriores = readdirSync(MIGRACIONES).filter((m) => /^\d/.test(m) && m > BASE);
      expect(posteriores.length).toBeGreaterThan(0);
      prisma(url, 'migrate', 'deploy');
      expect(prisma(url, 'migrate', 'status')).toMatch(/up to date/i);

      expect(await huellas(db, antes)).toEqual(antes);
    } finally {
      await db.$disconnect();
      rmSync(parcial, { recursive: true, force: true });
      await pg.stop();
    }
  });
});
