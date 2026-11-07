// Autorizacion y catalogos de la fase 1 (RF-008, CC-007) y bitacora (Tabla 28, RK-03).
// La matriz completa de rol por endpoint esta en roles.spec.ts.
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BitacoraService, USUARIO_TECNICO } from '../../src/bitacora/bitacora.service';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { crearApp, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
const http = () => request(app.getHttpServer());

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
});

afterAll(() => app.close());

describe('Catalogos institucionales: quien da de alta que (Tablas 5, 11 y 12; CC-007)', () => {
  const materia = { clave: 'TEST-001', planClave: 'ISW-2024', nombre: 'Materia de prueba', creditos: 4 };

  it('todos los roles leen catalogos', async () => {
    const auth = await entrar(app, 'alumno@sce.test');
    const res = await http().get('/materias').set('Authorization', auth).expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('coordinacion da de alta materias; el duplicado da 409 y la entrada invalida 400', async () => {
    const auth = await entrar(app, 'coordinacion@sce.test');
    await http().post('/materias').set('Authorization', auth).send(materia).expect(201);
    const dup = await http().post('/materias').set('Authorization', auth).send(materia).expect(409);
    expect(dup.body.codigo).toBe('YA_EXISTE');
    const invalida = await http()
      .post('/materias')
      .set('Authorization', auth)
      .send({ ...materia, clave: 'X', creditos: 0 })
      .expect(400);
    expect(invalida.body).toMatchObject({ codigo: 'ENTRADA_INVALIDA', campos: ['creditos'] });
  });

  it('coordinacion da de alta periodos con fecha simple; la base rechaza un rango invertido con 400', async () => {
    const auth = await entrar(app, 'coordinacion@sce.test');
    const periodo = { clave: '2030A', fechaInicio: '2030-01-10', fechaFin: '2030-06-30', estado: 'abierto' };
    await http().post('/periodos').set('Authorization', auth).send(periodo).expect(201);
    const invertido = await http()
      .post('/periodos')
      .set('Authorization', auth)
      .send({ ...periodo, clave: '2030B', fechaFin: '2029-01-01' })
      .expect(400);
    expect(invertido.body.codigo).toBe('ENTRADA_INVALIDA');
  });

  it('el administrador da de alta facultades y planes, con bitacora; un plan sin facultad da 400', async () => {
    const auth = await entrar(app, 'administrador@sce.test');
    const yo = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'administrador@sce.test' } });
    await http()
      .post('/facultades')
      .set('Authorization', auth)
      .send({ clave: 'TESTF', nombre: 'Facultad' })
      .expect(201);
    const plan = { clave: 'TEST-P', facultadClave: 'TESTF', creditosTotales: 300, vigenteDesde: '2030-01-01' };
    await http().post('/planes').set('Authorization', auth).send(plan).expect(201);

    const sinFacultad = await http()
      .post('/planes')
      .set('Authorization', auth)
      .send({ ...plan, clave: 'TEST-Q', facultadClave: 'NO-EXISTE' })
      .expect(400);
    expect(sinFacultad.body.codigo).toBe('REFERENCIA_INEXISTENTE');

    for (const [accion, entidad] of [
      ['alta_facultad', 'facultad:TESTF'],
      ['alta_plan', 'plan_estudios:TEST-P'],
    ]) {
      expect(await prisma.bitacora.count({ where: { autor: yo.id, accion, entidad } })).toBe(1);
    }
  });

  it('RF-002: coordinacion agrega y quita prerrequisitos; rechaza el ciclo y el duplicado', async () => {
    const auth = await entrar(app, 'coordinacion@sce.test');
    const agregar = (materia: string, requiereClave: string) =>
      http().post(`/materias/${materia}/prerrequisitos`).set('Authorization', auth).send({ requiereClave });

    // El seed trae ISW-301 -> ISW-201 -> ISW-101.
    expect((await agregar('ISW-101', 'ISW-301').expect(409)).body.codigo).toBe('PRERREQUISITO_CIRCULAR');
    expect((await agregar('ISW-701', 'ISW-701').expect(409)).body.codigo).toBe('PRERREQUISITO_CIRCULAR');
    expect((await agregar('ISW-201', 'ISW-101').expect(409)).body.codigo).toBe('YA_EXISTE');
    expect((await agregar('ISW-701', 'NO-EXISTE').expect(400)).body.codigo).toBe('REFERENCIA_INEXISTENTE');
    await agregar('ISW-701', 'mala clave').expect(400);

    expect((await agregar('ISW-701', 'ISW-301').expect(201)).body).toEqual({
      materiaClave: 'ISW-701',
      requiereClave: 'ISW-301',
      obligatorio: true,
    });
    const quitar = () => http().delete('/materias/ISW-701/prerrequisitos/ISW-301').set('Authorization', auth);
    await quitar().expect(204);
    await quitar().expect(404);
  });

  it('14.1-6: si la bitacora falla, el alta se revierte', async () => {
    const auth = await entrar(app, 'administrador@sce.test');
    const espia = jest.spyOn(app.get(BitacoraService), 'registrar').mockRejectedValueOnce(new Error('falla simulada'));
    await http()
      .post('/facultades')
      .set('Authorization', auth)
      .send({ clave: 'REVERTIDA', nombre: 'No queda' })
      .expect(500);
    espia.mockRestore();
    expect(await prisma.facultad.count({ where: { clave: 'REVERTIDA' } })).toBe(0);
  });
});

describe('RK-03 bitacora inmutable', () => {
  it('la base rechaza UPDATE, DELETE y TRUNCATE sobre bitacora', async () => {
    // Sin filas, UPDATE y DELETE no disparan el trigger por fila y "pasarian": se inserta una primero.
    await prisma.bitacora.create({ data: { autor: USUARIO_TECNICO, accion: 'prueba_inmutable', entidad: 'bitacora' } });
    for (const sql of ['UPDATE bitacora SET accion = accion', 'DELETE FROM bitacora', 'TRUNCATE bitacora']) {
      await expect(prisma.$executeRawUnsafe(sql)).rejects.toThrow(/inmutable/);
    }
  });
});
