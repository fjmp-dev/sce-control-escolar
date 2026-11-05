// Alta, baja y cambio de rol de usuarios (plan de trabajo #22, RF-008, RNF-SEG-001).
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

const CORREO = 'nuevo.profesor@sce.test';
let app: INestApplication;
let prisma: PrismaService;

const token = async (correo: string, contrasena = 'sce-dev-2026') =>
  `Bearer ${(await request(app.getHttpServer()).post('/auth/login').send({ correo, contrasena }).expect(200)).body.accessToken}`;

beforeAll(async () => {
  app = (await Test.createTestingModule({ imports: [AppModule] }).compile()).createNestApplication();
  await app.init();
  prisma = app.get(PrismaService);
  // La bitacora conserva la referencia al usuario (FK RESTRICT), asi que el usuario de prueba
  // no se borra: se reutiliza entre corridas y solo se restablece su estado.
  await prisma.usuario.updateMany({ where: { correo: CORREO }, data: { activo: true } });
});

afterAll(() => app.close());

it.each(['alumno', 'profesor', 'coordinacion', 'caja', 'direccion'])('%s recibe 403 en /usuarios', async (rol) => {
  const auth = await token(`${rol}@sce.test`);
  await request(app.getHttpServer()).get('/usuarios').set('Authorization', auth).expect(403);
});

it('control escolar da de alta, cambia rol y da de baja; cada paso queda en bitacora', async () => {
  const http = request(app.getHttpServer());
  const auth = await token('control.escolar@sce.test');
  const cuerpo = { correo: CORREO, contrasena: 'contrasena-larga-1', roles: ['profesor'] };

  let usuario = await prisma.usuario.findUnique({ where: { correo: CORREO } });
  if (!usuario) {
    const alta = await http.post('/usuarios').set('Authorization', auth).send(cuerpo).expect(201);
    expect(alta.body).toEqual({ id: expect.any(String), correo: CORREO, activo: true, roles: ['profesor'] });
    expect(alta.body).not.toHaveProperty('hashContrasena');
    usuario = await prisma.usuario.findUniqueOrThrow({ where: { correo: CORREO } });
  }
  await http.post('/usuarios').set('Authorization', auth).send(cuerpo).expect(409);
  await http.post('/usuarios').set('Authorization', auth).send({ ...cuerpo, correo: 'x@sce.test', contrasena: 'corta' }).expect(400);
  await http.post('/usuarios').set('Authorization', auth).send({ ...cuerpo, correo: 'x@sce.test', roles: ['root'] }).expect(400);

  const nuevo = await token(CORREO, cuerpo.contrasena);
  await http.get('/usuarios').set('Authorization', nuevo).expect(403);

  const cambio = await http.patch(`/usuarios/${usuario.id}`).set('Authorization', auth).send({ roles: ['coordinacion'] }).expect(200);
  expect(cambio.body.roles).toEqual(['coordinacion']);
  // El rol se lee de la base en cada peticion: el cambio surte efecto con el mismo token.
  await http.post('/periodos').set('Authorization', nuevo).send({}).expect(400);

  await http.patch(`/usuarios/${usuario.id}`).set('Authorization', auth).send({ activo: false, roles: ['profesor'] }).expect(200);
  await http.get('/materias').set('Authorization', nuevo).expect(401);

  const ultima = await prisma.bitacora.findFirstOrThrow({
    where: { entidad: `usuario:${usuario.id}`, accion: 'cambio_usuario' },
    orderBy: { id: 'desc' },
  });
  expect(ultima.valorAnterior).toMatchObject({ activo: true, roles: ['coordinacion'] });
});

it('responde 404 a un usuario inexistente y 400 a un id que no es UUID', async () => {
  const http = request(app.getHttpServer());
  const auth = await token('control.escolar@sce.test');
  await http.patch('/usuarios/00000000-0000-0000-0000-000000000000').set('Authorization', auth).send({ activo: true }).expect(404);
  await http.patch('/usuarios/abc').set('Authorization', auth).send({ activo: true }).expect(400);
});
