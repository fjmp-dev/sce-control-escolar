// CF-ROL-01 y CI-AUTH-01 (Tablas 43 y 45; AU-15): cada token, contra cada endpoint.
// La fuente es la matriz publicada: si el codigo y el documento difieren, esta prueba falla.
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { crearApp, entrar, filasDeLaMatriz } from './app';

const COLUMNAS = ['alumno', 'profesor', 'control.escolar', 'coordinacion', 'caja', 'direccion', 'administrador'];

const protegidas = filasDeLaMatriz().filter((f) => f.permisos[0] !== 'Público');
const casos = protegidas.flatMap((f) =>
  COLUMNAS.map((cuenta, i) => [f.metodo, f.ruta, cuenta, f.permisos[i] === 'Sí'] as const),
);

let app: INestApplication;

beforeAll(async () => {
  ({ app } = await crearApp());
});

afterAll(() => app.close());

it('la matriz cubre los siete roles en cada fila', () => {
  expect(protegidas.length).toBeGreaterThan(10);
  for (const f of protegidas) {
    expect(f.permisos.slice(0, COLUMNAS.length).every((p) => p === 'Sí' || p === 'No')).toBe(true);
  }
});

it.each(casos)('%s %s con token de %s: permitido = %s', async (metodo, ruta, cuenta, permitido) => {
  const verbo = metodo.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
  const url = ruta
    .replace('{id}', '5ce00000-0000-4000-8000-00000000ffff')
    .replace('{clave}', 'NO-EXISTE')
    .replace('{requiere}', 'NO-EXISTE')
    .replace('{matricula}', '0000000');
  const token = await entrar(app, `${cuenta}@sce.test`);
  const res = await request(app.getHttpServer())[verbo](url).set('Authorization', token).send({});
  if (permitido) {
    expect([401, 403]).not.toContain(res.status);
  } else {
    expect(res.status).toBe(403);
    expect(res.body.codigo).toBe('SIN_PERMISO');
  }
});
