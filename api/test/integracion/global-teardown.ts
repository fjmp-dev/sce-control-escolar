import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export default async function () {
  await (globalThis as { pgDePruebas?: StartedPostgreSqlContainer }).pgDePruebas?.stop();
}
