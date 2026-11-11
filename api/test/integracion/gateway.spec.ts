// Gateway (Tablas 28 y 57): salud, formato de errores, registros sin datos sensibles.
// CS-SEG-05 se ejecuta con ZAP (scripts/zap.sh); aqui quedan los casos concretos, para que no reaparezcan.
import { INestApplication, LoggerService } from '@nestjs/common';
import request from 'supertest';
import { CatalogosRepository } from '../../src/academico/catalogos.repository';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { CONTRASENA, crearApp, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
const http = () => request(app.getHttpServer());

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
});

afterAll(() => app.close());

describe('GET /salud (Fig. 9, Tabla 57)', () => {
  it('responde sin token y no expone detalle', async () => {
    expect((await http().get('/salud').expect(200)).body).toEqual({ estado: 'ok' });
  });

  it('responde 503 si la base no contesta', async () => {
    const espia = jest.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('sin conexion'));
    expect((await http().get('/salud').expect(503)).body.codigo).toBe('SERVICIO_NO_DISPONIBLE');
    espia.mockRestore();
  });
});

describe('GET /metricas (Tabla 57, RNF-REN-001)', () => {
  it('percentil 95 por ruta plantilla y errores de negocio, sin identificadores ni datos personales', async () => {
    await http().get('/alumnos/1234567').expect(401);
    await http().post('/sesiones').send({ correo: 'alumno@sce.test', contrasena: 'equivocada-123' }).expect(401);
    const texto = (await http().get('/metricas').expect(200).expect('Content-Type', /text\/plain/)).text;
    expect(texto).toMatch(/sce_http_duracion_segundos_bucket\{le="3",metodo="GET",ruta="\/alumnos\/:matricula",estado="401"\} [1-9]/);
    expect(texto).toMatch(/sce_errores_negocio_total\{codigo="CREDENCIALES_INVALIDAS"\} [1-9]/);
    expect(texto).toMatch(/sce_process_resident_memory_bytes \d/);
    expect(texto).not.toMatch(/1234567|alumno@sce\.test|equivocada/);
  });
});

describe('Errores con codigo de negocio, sin trazas (Tabla 28, CS-SEG-05)', () => {
  const sinTraza = (texto: string) => {
    for (const fuga of [/\bat .*\.(js|ts):\d+/, /prisma/i, /SELECT|INSERT/, /node_modules/]) {
      expect(texto).not.toMatch(fuga);
    }
  };

  it('ruta inexistente: 404 en el formato de la API', async () => {
    expect((await http().get('/no-existe').expect(404)).body).toEqual({
      codigo: 'NO_ENCONTRADO',
      mensaje: expect.any(String),
    });
  });

  it('sin token: 401 en el formato de la API', async () => {
    expect((await http().get('/usuarios').expect(401)).body.codigo).toBe('NO_AUTENTICADO');
  });

  it.each([
    ['JSON mal formado', 400, '{"correo": '],
    ['cuerpo demasiado grande', 413, JSON.stringify({ correo: 'a@b.mx', contrasena: 'x'.repeat(2_000_000) })],
  ])('%s: %i sin eco ni traza', async (_, estado, cuerpo) => {
    const res = await http().post('/sesiones').set('Content-Type', 'application/json').send(cuerpo);
    expect(res.status).toBe(estado);
    expect(res.body.codigo).toBe('ENTRADA_INVALIDA');
    sinTraza(res.text);
  });

  it.each([
    ['caracter nulo', { clave: 'A\u0000B', nombre: 'x' }, ['clave']],
    ['clave demasiado larga', { clave: 'x'.repeat(21), nombre: 'x' }, ['clave']],
    ['clave con otros caracteres', { clave: 'www.google.com/', nombre: 'x' }, ['clave']],
    ['inyeccion en la clave', { clave: "A' OR '1'='1", nombre: 'x' }, ['clave']],
    ['propiedad no declarada', { clave: 'A', nombre: 'x', extra: 1 }, ['extra']],
    ['tipo equivocado', { clave: { $ne: 1 }, nombre: ['x'] }, ['clave', 'nombre']],
  ])('%s: 400 con los campos a revisar y sin tocar la base', async (_, cuerpo, campos) => {
    const antes = await prisma.facultad.count();
    const auth = await entrar(app, 'administrador@sce.test');
    const res = await http().post('/facultades').set('Authorization', auth).send(cuerpo).expect(400);
    expect(res.body.campos).toEqual(campos);
    expect(await prisma.facultad.count()).toBe(antes);
  });

  it('error inesperado: 500 generico, sin el mensaje original', async () => {
    const token = await entrar(app, 'caja@sce.test');
    const espia = jest
      .spyOn(app.get(CatalogosRepository), 'facultades')
      .mockRejectedValueOnce(new Error('postgresql://sce_app:clave-secreta@db/sce'));
    const res = await http().get('/facultades').set('Authorization', token).expect(500);
    espia.mockRestore();
    expect(res.body.codigo).toBe('ERROR_INTERNO');
    expect(res.text).not.toContain('clave-secreta');
    sinTraza(res.text);
  });

  it('cabeceras: sin X-Powered-By, sin cache y sin deteccion de tipo', async () => {
    const { headers } = await http().get('/salud');
    expect(headers['x-powered-by']).toBeUndefined();
    expect(headers['cache-control']).toBe('no-store');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['cross-origin-resource-policy']).toBe('same-origin');
  });
});

describe('CS-SEG-08: los registros no llevan datos sensibles (Tabla 57)', () => {
  it('ni contrasena, ni token, ni correo, ni identificadores en la ruta; el 500 solo deja nombre y pila', async () => {
    const lineas: unknown[] = [];
    const captura: LoggerService = {
      log: (m: unknown) => lineas.push(m),
      error: (m: unknown) => lineas.push(m),
      warn: (m: unknown) => lineas.push(m),
    };
    app.useLogger(captura);

    await http()
      .post('/sesiones')
      .send({ correo: 'alumno@sce.test', contrasena: 'contrasena-de-prueba-1' })
      .expect(401);
    const token = await entrar(app, 'administrador@sce.test');
    await http()
      .patch('/usuarios/5ce00000-0000-4000-8000-00000000abcd?correo=alumno@sce.test')
      .set('Authorization', token)
      .send({ confirmacion: CONTRASENA, activo: true })
      .expect(404);
    const espia = jest
      .spyOn(app.get(CatalogosRepository), 'facultades')
      .mockRejectedValueOnce(new Error('postgresql://sce_app:clave-secreta@db/sce'));
    await http().get('/facultades').set('Authorization', token).expect(500);
    espia.mockRestore();

    const texto = JSON.stringify(lineas);
    for (const sensible of [
      'contrasena-de-prueba-1',
      CONTRASENA,
      token.split(' ')[1],
      '@sce.test',
      'abcd',
      'clave-secreta',
    ]) {
      expect(texto).not.toContain(sensible);
    }
    expect(lineas).toContainEqual(
      expect.objectContaining({ metodo: 'POST', ruta: '/sesiones', estado: 401, codigo: 'CREDENCIALES_INVALIDAS' }),
    );
    expect(lineas).toContainEqual(expect.objectContaining({ metodo: 'PATCH', ruta: '/usuarios/:id', estado: 404 }));
    expect(lineas).toContainEqual(expect.objectContaining({ error: 'Error', pila: expect.any(Array) }));
  });
});
