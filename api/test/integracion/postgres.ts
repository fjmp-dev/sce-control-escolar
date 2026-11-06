// PostgreSQL efimero con la version de la Tabla 7, y la CLI de Prisma apuntando a el (Tablas 42, 45 y 53).
import { execFileSync } from 'node:child_process';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export const postgres = (): Promise<StartedPostgreSqlContainer> =>
  new PostgreSqlContainer('postgres:16').withUsername('sce_app').withPassword('sce_prueba').withDatabase('sce').start();

export const urlDe = (pg: StartedPostgreSqlContainer) => `${pg.getConnectionUri()}?schema=public`;

export const prisma = (url: string, ...args: string[]) =>
  execFileSync('node_modules/.bin/prisma', args, {
    env: { ...process.env, DATABASE_URL: url, PRISMA_HIDE_UPDATE_MESSAGE: '1' },
    stdio: 'pipe',
    encoding: 'utf8',
  });
