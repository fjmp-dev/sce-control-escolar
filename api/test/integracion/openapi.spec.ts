// 14.4: el contrato se genera desde los decoradores y se versiona en docs/api/openapi.json.
// Tras cambiar una ruta: ACTUALIZAR_OPENAPI=1 npm run test:integracion -- openapi
import { readFileSync, writeFileSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { crearApp, filasDeLaMatriz } from './app';

const RUTA = '../docs/api/openapi.json';
const PUBLICAS = ['GET /salud', 'POST /sesiones'];
let app: INestApplication;
let documento: OpenAPIObject;

const operaciones = () =>
  Object.entries(documento.paths).flatMap(([ruta, item]) =>
    Object.entries(item as Record<string, { security?: unknown[] }>).map(([metodo, op]) => ({
      clave: `${metodo.toUpperCase()} ${ruta}`,
      protegida: Boolean(op.security?.length),
    })),
  );

beforeAll(async () => {
  ({ app } = await crearApp());
  documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('API del SCE').setVersion('0.1.0').addBearerAuth().build(),
  );
  if (process.env.ACTUALIZAR_OPENAPI) writeFileSync(RUTA, `${JSON.stringify(documento, null, 2)}\n`);
});

afterAll(() => app.close());

it('el contrato versionado coincide con los decoradores', () => {
  expect(documento).toEqual(JSON.parse(readFileSync(RUTA, 'utf8')));
});

it('R-19, Tabla 38: solo el inicio de sesion y la salud son anonimos', () => {
  expect(
    operaciones()
      .filter((o) => !o.protegida)
      .map((o) => o.clave)
      .sort(),
  ).toEqual(PUBLICAS);
});

it('AU-15: la matriz rol por endpoint tiene exactamente las operaciones del contrato', () => {
  const enMatriz = filasDeLaMatriz().map((f) => `${f.metodo} ${f.ruta}`);
  expect(enMatriz.sort()).toEqual(
    operaciones()
      .map((o) => o.clave)
      .sort(),
  );
});

it('CS-SEG-04: la coleccion de Newman prueba sin token cada operacion protegida', () => {
  const coleccion = JSON.parse(readFileSync('test/contratos/sce.postman_collection.json', 'utf8')) as {
    item: { name: string; item: { request: { method: string; url: { raw: string } } }[] }[];
  };
  const sinToken = coleccion.item.find((c) => c.name.startsWith('CS-SEG-04'));
  const probadas = (sinToken?.item ?? []).map(
    ({ request }) =>
      `${request.method} ${request.url.raw
        .replace('{{base}}', '')
        .replace(/[0-9a-f-]{36}/, '{id}')
        .replace('NO-EXISTE', '{clave}')
        .replace('NO-EXISTE', '{requiere}')}`,
  );
  expect(probadas.sort()).toEqual(
    operaciones()
      .filter((o) => o.protegida)
      .map((o) => o.clave)
      .sort(),
  );
});
