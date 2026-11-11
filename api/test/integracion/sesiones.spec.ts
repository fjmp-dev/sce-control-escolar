// CS-SEG-07 (Tabla 49) y bloqueo por intentos (Tabla 15, Resistencia; Parte B de PA-SCE-001).
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { USUARIO_TECNICO } from '../../src/bitacora/bitacora.service';
import { MAX_FALLOS } from '../../src/identidad/dominio/usuario';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { CONTRASENA, crearApp, crearCuenta, entrar, iniciar } from './app';

let app: INestApplication;
let prisma: PrismaService;
let jwt: JwtService;
const http = () => request(app.getHttpServer());
const actual = (token: string) => http().get('/sesiones/actual').set('Authorization', token);
const reclamos = (token: string) =>
  jwt.decode<{ iat: number; exp: number; sub: string; sv: number; ini: number }>(token);

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  jwt = app.get(JwtService);
});

afterAll(() => app.close());

describe('R-20 y CS-SEG-07: la sesion expira en el tiempo configurado', () => {
  it('los tokens duran lo configurado: 60 minutos, 15 si el rol es privilegiado', async () => {
    const normal = await iniciar(app, 'caja@sce.test');
    const admin = await iniciar(app, 'administrador@sce.test');
    const n = reclamos(normal.token);
    expect(n.exp - n.iat).toBe(3600);
    expect(new Date(normal.expiraEn).getTime()).toBe(n.exp * 1000);
    const a = reclamos(admin.token);
    expect(a.exp - a.iat).toBe(900);
  });

  it('rechaza un token expirado, alterado, sin firma o sin reclamos de sesion', async () => {
    const { id } = await crearCuenta(prisma, 'expira@sce.test');
    const ini = Math.floor(Date.now() / 1000);
    const expirado = await jwt.signAsync({ sub: id, sv: 0, ini }, { expiresIn: -1 });
    const sinVersion = await jwt.signAsync({ sub: id, ini });
    const sinInicio = await jwt.signAsync({ sub: id, sv: 0 });
    const sinFirma = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: id, sv: 0, ini })).toString('base64url')}.`;
    for (const token of [expirado, sinVersion, sinInicio, sinFirma, 'no.es.jwt']) {
      const res = await actual(`Bearer ${token}`).expect(401);
      expect(res.body.codigo).toBe('NO_AUTENTICADO');
    }
    await http().get('/sesiones/actual').set('Authorization', 'Basic abc').expect(401);
  });
});

describe('R-20 y CS-SEG-07: el token revocado no se reutiliza', () => {
  it('el cierre de sesion revoca el token; iniciar sesion de nuevo funciona', async () => {
    await crearCuenta(prisma, 'cierra@sce.test');
    const token = await entrar(app, 'cierra@sce.test');
    await actual(token).expect(200);
    await http().delete('/sesiones/actual').set('Authorization', token).expect(204);
    await actual(token).expect(401);
    await http().delete('/sesiones/actual').set('Authorization', token).expect(401);
    await http().post('/sesiones/actual/renovacion').set('Authorization', token).expect(401);
    await actual(await entrar(app, 'cierra@sce.test')).expect(200);
  });

  it('el cierre revoca todas las sesiones de la cuenta', async () => {
    await crearCuenta(prisma, 'dos@sce.test');
    const primera = await entrar(app, 'dos@sce.test');
    const segunda = await entrar(app, 'dos@sce.test');
    await http().delete('/sesiones/actual').set('Authorization', primera).expect(204);
    await actual(segunda).expect(401);
  });
});

describe('Tabla 38: renovacion controlada', () => {
  it('renueva con un token vigente y conserva el inicio de la sesion', async () => {
    await crearCuenta(prisma, 'renueva@sce.test');
    const { token } = await iniciar(app, 'renueva@sce.test');
    const res = await http().post('/sesiones/actual/renovacion').set('Authorization', `Bearer ${token}`).expect(200);
    expect(reclamos(res.body.token).ini).toBe(reclamos(token).ini);
    await actual(`Bearer ${res.body.token}`).expect(200);
  });

  it('no renueva pasada la sesion maxima, y el ultimo token no la rebasa', async () => {
    const { id } = await crearCuenta(prisma, 'maxima@sce.test');
    const ahora = Math.floor(Date.now() / 1000);
    const vencida = await jwt.signAsync({ sub: id, sv: 0, ini: ahora - 480 * 60 });
    const res = await http().post('/sesiones/actual/renovacion').set('Authorization', `Bearer ${vencida}`).expect(401);
    expect(res.body.codigo).toBe('SESION_VENCIDA');

    const casi = await jwt.signAsync({ sub: id, sv: 0, ini: ahora - 479 * 60 });
    const ultimo = await http().post('/sesiones/actual/renovacion').set('Authorization', `Bearer ${casi}`).expect(200);
    const r = reclamos(ultimo.body.token);
    expect(r.exp - r.iat).toBeLessThanOrEqual(60);
  });
});

describe('Cambio de contrasena propia', () => {
  it('exige la actual, aplica la politica, revoca las sesiones y deja traza sin valores', async () => {
    const { id } = await crearCuenta(prisma, 'cambia@sce.test');
    const token = await entrar(app, 'cambia@sce.test');
    const cambio = (actualC: string, nueva: string) =>
      http().put('/usuarios/actual/contrasena').set('Authorization', token).send({ actual: actualC, nueva });

    expect((await cambio('equivocada-1', 'contrasena-nueva-1').expect(403)).body.codigo).toBe(
      'REAUTENTICACION_FALLIDA',
    );
    expect((await cambio(CONTRASENA, 'corta1').expect(400)).body.codigo).toBe('CONTRASENA_DEBIL');
    await cambio(CONTRASENA, 'contrasena-nueva-1').expect(204);

    await actual(token).expect(401);
    await http().post('/sesiones').send({ correo: 'cambia@sce.test', contrasena: CONTRASENA }).expect(401);
    await entrar(app, 'cambia@sce.test', 'contrasena-nueva-1');

    const traza = await prisma.bitacora.findFirstOrThrow({ where: { autor: id, accion: 'cambio_contrasena' } });
    expect(traza.valorAnterior).toBeNull();
  });
});

describe('Bloqueo por intentos fallidos', () => {
  const intento = (correo: string, contrasena: string) => http().post('/sesiones').send({ correo, contrasena });

  it('tras cinco fallos la contrasena correcta tampoco entra, y todo queda en bitacora con el usuario tecnico', async () => {
    const { id } = await crearCuenta(prisma, 'bloqueo@sce.test');
    for (let i = 0; i < MAX_FALLOS; i++) await intento('bloqueo@sce.test', 'mala-contrasena-1').expect(401);
    await intento('bloqueo@sce.test', CONTRASENA).expect(401);

    const asientos = await prisma.bitacora.findMany({ where: { entidad: `usuario:${id}` } });
    expect(asientos.filter((a) => a.accion === 'acceso_fallido')).toHaveLength(MAX_FALLOS);
    expect(asientos.filter((a) => a.accion === 'acceso_bloqueado')).toHaveLength(1);
    expect(asientos.every((a) => a.autor === USUARIO_TECNICO)).toBe(true);
  });

  it('cuatro fallos no bloquean, y los de hace mas de 15 minutos ya no cuentan', async () => {
    const { id } = await crearCuenta(prisma, 'ventana@sce.test');
    const hace16 = new Date(Date.now() - 16 * 60_000);
    const datos = { autor: USUARIO_TECNICO, accion: 'acceso_fallido', entidad: `usuario:${id}` };
    await prisma.bitacora.createMany({ data: Array.from({ length: MAX_FALLOS }, () => ({ ...datos, fecha: hace16 })) });
    await prisma.bitacora.createMany({ data: Array.from({ length: MAX_FALLOS - 1 }, () => datos) });
    expect((await intento('ventana@sce.test', CONTRASENA)).status).toBe(201);
  });

  it('el mismo mensaje exista o no la cuenta, este o no bloqueada: no revela cuentas', async () => {
    await crearCuenta(prisma, 'mensaje@sce.test');
    const respuestas = [];
    respuestas.push(await intento('nadie@sce.test', 'mala-contrasena-1').expect(401));
    for (let i = 0; i <= MAX_FALLOS; i++)
      respuestas.push(await intento('mensaje@sce.test', 'mala-contrasena-1').expect(401));
    expect(new Set(respuestas.map((r) => JSON.stringify(r.body))).size).toBe(1);
    expect(respuestas[0].body.codigo).toBe('CREDENCIALES_INVALIDAS');
    expect(await prisma.bitacora.count({ where: { entidad: 'usuario:desconocido' } })).toBeGreaterThan(0);
  });

  it('el usuario tecnico (CC-015) no puede autenticarse, y una cuenta inactiva tampoco', async () => {
    for (const contrasena of ['!', 'cualquier-cosa-1']) {
      expect((await intento('sistema@sce.interno', contrasena)).status).toBe(401);
    }
    await prisma.usuario.create({ data: { correo: 'inactiva@sce.test', hashContrasena: 'x', activo: false } });
    expect((await intento('inactiva@sce.test', CONTRASENA)).status).toBe(401);
  });
});
