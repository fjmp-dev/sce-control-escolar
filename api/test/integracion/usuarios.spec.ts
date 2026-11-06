// Altas, bajas y cambios de rol por el administrador (Tablas 11 y 12, CC-007, CC-010; Parte B de PA-SCE-001).
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BitacoraService, USUARIO_TECNICO } from '../../src/bitacora/bitacora.service';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { CONTRASENA, crearApp, entrar } from './app';

const CONTRASENA_NUEVA = 'contrasena-larga-1';
let app: INestApplication;
let prisma: PrismaService;
let admin: string;
const http = () => request(app.getHttpServer());

const alta = (correo: string, extra: object = {}) =>
  http()
    .post('/usuarios')
    .set('Authorization', admin)
    .send({ confirmacion: CONTRASENA, correo, contrasena: CONTRASENA_NUEVA, roles: ['profesor'], ...extra });

const cambio = (id: string, cuerpo: object) =>
  http()
    .patch(`/usuarios/${id}`)
    .set('Authorization', admin)
    .send({ confirmacion: CONTRASENA, ...cuerpo });

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  admin = await entrar(app, 'administrador@sce.test');
});

afterAll(() => app.close());

it('alta, cambio de rol y baja; cada paso queda en bitacora con autor y valor anterior, sin hash', async () => {
  const res = await alta('nuevo.profesor@sce.test').expect(201);
  const id = res.body.id as string;
  expect(res.body).toEqual({ id, correo: 'nuevo.profesor@sce.test', activo: true, roles: ['profesor'] });

  const yo = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'administrador@sce.test' } });
  expect(
    await prisma.bitacora.count({ where: { autor: yo.id, accion: 'alta_usuario', entidad: `usuario:${id}` } }),
  ).toBe(1);

  expect((await cambio(id, { roles: ['coordinacion'] }).expect(200)).body.roles).toEqual(['coordinacion']);
  await cambio(id, { activo: false, roles: ['profesor'] }).expect(200);

  const ultima = await prisma.bitacora.findFirstOrThrow({
    where: { entidad: `usuario:${id}`, accion: 'cambio_usuario' },
    orderBy: { id: 'desc' },
  });
  expect(ultima.autor).toBe(yo.id);
  expect(ultima.valorAnterior).toEqual({
    id,
    correo: 'nuevo.profesor@sce.test',
    activo: true,
    roles: ['coordinacion'],
  });
});

it('CS-SEG-07: un cambio de roles o una baja revocan los tokens, y reactivar no los revive', async () => {
  const { body } = await alta('revocado@sce.test').expect(201);
  const id = body.id as string;
  const yoDe = (t: string) => http().get('/sesiones/actual').set('Authorization', t);

  const porRol = await entrar(app, 'revocado@sce.test', CONTRASENA_NUEVA);
  await cambio(id, { roles: ['caja'] }).expect(200);
  await yoDe(porRol).expect(401);

  const porBaja = await entrar(app, 'revocado@sce.test', CONTRASENA_NUEVA);
  await yoDe(porBaja).expect(200);
  await cambio(id, { activo: false }).expect(200);
  await yoDe(porBaja).expect(401);
  await cambio(id, { activo: true }).expect(200);
  await yoDe(porBaja).expect(401);
  await yoDe(await entrar(app, 'revocado@sce.test', CONTRASENA_NUEVA)).expect(200);
});

it('Parte B: operar sobre cuentas exige confirmar la contrasena del administrador', async () => {
  await alta('sin-confirmar@sce.test', { confirmacion: undefined }).expect(400);
  const mala = await alta('sin-confirmar@sce.test', { confirmacion: 'equivocada-123' }).expect(403);
  expect(mala.body.codigo).toBe('REAUTENTICACION_FALLIDA');
  expect(await prisma.usuario.count({ where: { correo: 'sin-confirmar@sce.test' } })).toBe(0);

  const { id } = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'caja@sce.test' } });
  await cambio(id, { activo: false, confirmacion: 'equivocada-123' }).expect(403);
  expect((await prisma.usuario.findUniqueOrThrow({ where: { id } })).activo).toBe(true);
});

it('valida la entrada: politica de contrasena, rol inexistente, correo repetido sin distinguir mayusculas', async () => {
  const debil = await alta('debil@sce.test', { contrasena: 'corta' }).expect(400);
  expect(debil.body.codigo).toBe('CONTRASENA_DEBIL');
  await alta('rol@sce.test', { roles: ['root'] }).expect(400);
  await alta('roles@sce.test', { roles: [] }).expect(400);

  await alta('Mayusculas@sce.test').expect(201);
  expect((await alta('mayusculas@SCE.test').expect(409)).body.codigo).toBe('YA_EXISTE');
});

it('el administrador no cambia su propio acceso, ni al usuario tecnico, y este no aparece en la lista', async () => {
  const yo = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'administrador@sce.test' } });
  expect((await cambio(yo.id, { activo: false }).expect(409)).body.codigo).toBe('AUTOMODIFICACION');
  await cambio(USUARIO_TECNICO, { roles: ['administrador'] }).expect(404);

  const lista = await http().get('/usuarios').set('Authorization', admin).expect(200);
  const correos = (lista.body as { correo: string }[]).map((u) => u.correo);
  expect(correos).toContain('alumno@sce.test');
  expect(correos).not.toContain('sistema@sce.interno');
});

it('CS-SEG-08: ninguna respuesta de usuarios lleva el hash ni la version de sesion', async () => {
  const lista = await http().get('/usuarios').set('Authorization', admin).expect(200);
  const texto = JSON.stringify(lista.body);
  expect(texto).not.toMatch(/hash|\$2[aby]\$|sesionVersion/i);
});

it('un cambio sin nada que cambiar da 400 y no deja asiento ni revoca', async () => {
  const { id, sesionVersion } = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'caja@sce.test' } });
  const asientos = await prisma.bitacora.count({ where: { entidad: `usuario:${id}` } });
  expect((await cambio(id, {}).expect(400)).body.campos).toEqual(['activo', 'roles']);
  expect(await prisma.bitacora.count({ where: { entidad: `usuario:${id}` } })).toBe(asientos);
  expect((await prisma.usuario.findUniqueOrThrow({ where: { id } })).sesionVersion).toBe(sesionVersion);
});

it('responde 404 a un usuario inexistente y 400 a un id que no es UUID', async () => {
  await cambio('5ce00000-0000-4000-8000-00000000ffff', { activo: true }).expect(404);
  await cambio('abc', { activo: true }).expect(400);
});

it('14.1-6: si la bitacora falla, el alta se revierte', async () => {
  const espia = jest.spyOn(app.get(BitacoraService), 'registrar').mockRejectedValueOnce(new Error('falla simulada'));
  await alta('revertido@sce.test').expect(500);
  espia.mockRestore();
  expect(await prisma.usuario.count({ where: { correo: 'revertido@sce.test' } })).toBe(0);
});
