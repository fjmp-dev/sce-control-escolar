// Casos de seguridad de la fase 1 (docs/calidad/matriz-trazabilidad.md).
// Corre contra la base de desarrollo ya migrada y con seed: npm run db:seed.
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

const CONTRASENA = 'sce-dev-2026';
let app: INestApplication;
let prisma: PrismaService;

const login = async (correo: string) =>
  (await request(app.getHttpServer()).post('/auth/login').send({ correo, contrasena: CONTRASENA }).expect(200)).body
    .accessToken as string;

beforeAll(async () => {
  const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = mod.createNestApplication();
  await app.init();
  prisma = app.get(PrismaService);
});

afterAll(async () => {
  await prisma.materia.deleteMany({ where: { clave: 'TEST-001' } });
  await app.close();
});

describe('RF-008 autenticacion', () => {
  it('rechaza credenciales invalidas con el mismo 401 exista o no la cuenta', async () => {
    const http = request(app.getHttpServer());
    const a = await http.post('/auth/login').send({ correo: 'alumno@sce.test', contrasena: 'mala' }).expect(401);
    const b = await http.post('/auth/login').send({ correo: 'nadie@sce.test', contrasena: 'mala' }).expect(401);
    expect(a.body.message).toBe(b.body.message);
  });

  it('CS-SEG-04: sin token, token alterado o expirado recibe 401', async () => {
    const http = request(app.getHttpServer());
    await http.get('/materias').expect(401);
    await http.get('/materias').set('Authorization', 'Bearer no.es.jwt').expect(401);
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'alumno@sce.test' } });
    const expirado = await app.get(JwtService).signAsync({ sub: usuario.id }, { expiresIn: -1 });
    await http.get('/materias').set('Authorization', `Bearer ${expirado}`).expect(401);
  });

  it('CS-SEG-04: un usuario desactivado pierde el acceso aunque su token siga vigente', async () => {
    const token = await login('caja@sce.test');
    await prisma.usuario.update({ where: { correo: 'caja@sce.test' }, data: { activo: false } });
    try {
      await request(app.getHttpServer()).get('/materias').set('Authorization', `Bearer ${token}`).expect(401);
    } finally {
      await prisma.usuario.update({ where: { correo: 'caja@sce.test' }, data: { activo: true } });
    }
  });
});

describe('RF-008 autorizacion por rol (CI-AUTH-01, CF-ROL-01)', () => {
  const materia = { clave: 'TEST-001', planClave: 'ISW-2024', nombre: 'Materia de prueba', creditos: 4 };

  it('todos los roles leen catalogos', async () => {
    const token = await login('alumno@sce.test');
    const res = await request(app.getHttpServer()).get('/materias').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it.each(['alumno', 'profesor', 'control.escolar', 'caja', 'direccion'])(
    '%s recibe 403 al dar de alta catalogos',
    async (rol) => {
      const token = await login(`${rol}@sce.test`);
      await request(app.getHttpServer()).post('/materias').set('Authorization', `Bearer ${token}`).send(materia).expect(403);
    },
  );

  it('coordinacion da de alta una materia; el duplicado da 409 y la entrada invalida 400', async () => {
    const http = request(app.getHttpServer());
    const auth = `Bearer ${await login('coordinacion@sce.test')}`;
    await http.post('/materias').set('Authorization', auth).send(materia).expect(201);
    await http.post('/materias').set('Authorization', auth).send(materia).expect(409);
    await http.post('/materias').set('Authorization', auth).send({ ...materia, clave: 'X', creditos: 0 }).expect(400);
  });
});

describe('RNF-SEG-001 bitacora', () => {
  it('CS-SEG-06: la base rechaza UPDATE, DELETE y TRUNCATE sobre bitacora', async () => {
    for (const sql of ['UPDATE bitacora SET accion = accion', 'DELETE FROM bitacora', 'TRUNCATE bitacora']) {
      await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow(/inmutable/);
    }
  });
});

describe('RNF-DAT-001 calidad de datos (manual Tabla 39, en cada ejecucion del pipeline)', () => {
  it('CD-DAT-01: no hay matriculas duplicadas', async () => {
    const filas = await prisma.$queryRaw`SELECT matricula FROM alumno GROUP BY matricula HAVING count(*) > 1`;
    expect(filas).toEqual([]);
  });

  it('CD-DAT-04: no hay calificaciones huerfanas de grupo, periodo o profesor', async () => {
    const filas = await prisma.$queryRaw`
      SELECT c.id FROM calificacion c
        LEFT JOIN grupo g ON g.id = c.grupo_id
        LEFT JOIN periodo p ON p.clave = c.periodo_clave
        LEFT JOIN usuario u ON u.id = c.profesor_id
       WHERE g.id IS NULL OR p.clave IS NULL OR u.id IS NULL`;
    expect(filas).toEqual([]);
  });
});
