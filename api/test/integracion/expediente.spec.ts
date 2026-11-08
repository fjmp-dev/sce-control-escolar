// CF-EXP-01 (Tabla 43, Jest y Supertest), CS-SEG-02 y CS-SEG-03 (Tabla 49, Supertest) y CS-SEG-06 en plantel (SQL).
import { readFileSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BitacoraService } from '../../src/bitacora/bitacora.service';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { crearApp, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
let control: string;
const http = () => request(app.getHttpServer());
const consultaCsSeg06 = readFileSync('prisma/verificacion/cs-seg-06-plantel.sql', 'utf8');

const alta = (matricula: string, extra: object = {}) =>
  http()
    .post('/alumnos')
    .set('Authorization', control)
    .send({
      matricula,
      nombre: `Alumno de prueba ${matricula}`,
      facultadClave: 'CUTG',
      fechaIngreso: '2025-08-04',
      ...extra,
    });

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  control = await entrar(app, 'control.escolar@sce.test');
});

afterAll(() => app.close());

describe('CF-EXP-01: un solo expediente, aun tras el cambio de plantel', () => {
  it('el alta crea el expediente con su historial y su cuenta, y la matricula repetida se rechaza', async () => {
    const res = await alta('3100001').expect(201);
    expect(res.body).toMatchObject({
      matricula: '3100001',
      facultadClave: 'CUTG',
      estatus: 'activo',
      correo: null,
      historial: { promedio: 0, creditosAcumulados: 0, avance: 0 },
      trayectoria: [],
    });
    expect(await prisma.cuentaAlumno.count({ where: { matricula: '3100001' } })).toBe(1);
    expect((await alta('3100001').expect(409)).body.codigo).toBe('YA_EXISTE');
  });

  it('tras cambiar de facultad la consulta devuelve un solo expediente activo y el historial completo', async () => {
    await alta('3100002').expect(201);
    await prisma.historial.update({
      where: { matricula: '3100002' },
      data: { promedio: 8.75, creditosAcumulados: 120, avance: 30 },
    });
    await prisma.inscripcion.create({
      data: {
        folio: 'F-3100002-1',
        matricula: '3100002',
        periodoClave: '2027A',
        estado: 'rechazada',
        motivoRechazo: 'adeudo',
        grupos: { create: { grupoId: (await prisma.grupo.findFirstOrThrow({ where: { periodoClave: '2027A' } })).id } },
      },
    });

    const cambio = await http()
      .put('/alumnos/3100002/facultad')
      .set('Authorization', control)
      .send({ facultadClave: 'FSD' })
      .expect(200);
    expect(cambio.body).toMatchObject({
      matricula: '3100002',
      facultadClave: 'FSD',
      facultadNombre: 'Facultad Sintética Dos',
      estatus: 'activo',
      historial: { promedio: 8.75, creditosAcumulados: 120, avance: 30 },
      trayectoria: [{ de: 'CUTG', a: 'FSD', fecha: expect.any(String) }],
    });

    expect(await prisma.alumno.count({ where: { matricula: '3100002' } })).toBe(1);
    expect(await prisma.inscripcion.count({ where: { matricula: '3100002' } })).toBe(1);

    await http()
      .put('/alumnos/3100002/facultad')
      .set('Authorization', control)
      .send({ facultadClave: 'CUTG' })
      .expect(200);
    const consulta = await http().get('/alumnos/3100002').set('Authorization', control).expect(200);
    expect(consulta.body.trayectoria.map((t: { de: string; a: string }) => `${t.de}>${t.a}`)).toEqual([
      'CUTG>FSD',
      'FSD>CUTG',
    ]);
  });

  it('el cambio de plantel deja autor, accion, valor anterior y fecha en bitacora (Tabla 38)', async () => {
    await alta('3100003').expect(201);
    await http()
      .put('/alumnos/3100003/facultad')
      .set('Authorization', control)
      .send({ facultadClave: 'FSD' })
      .expect(200);
    const autor = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'control.escolar@sce.test' } });
    const asiento = await prisma.bitacora.findFirstOrThrow({
      where: { entidad: 'alumno:3100003', accion: 'cambio_plantel' },
    });
    expect(asiento).toMatchObject({
      autor: autor.id,
      valorAnterior: { facultadClave: 'CUTG' },
      fecha: expect.any(Date),
    });
  });

  it('14.1-6: si la bitacora falla, el cambio de plantel se revierte', async () => {
    await alta('3100004').expect(201);
    const espia = jest.spyOn(app.get(BitacoraService), 'registrar').mockRejectedValueOnce(new Error('falla simulada'));
    await http()
      .put('/alumnos/3100004/facultad')
      .set('Authorization', control)
      .send({ facultadClave: 'FSD' })
      .expect(500);
    espia.mockRestore();
    expect((await prisma.alumno.findUniqueOrThrow({ where: { matricula: '3100004' } })).facultadClave).toBe('CUTG');
  });

  it('estatus: baja, reingreso y egreso definitivo; un egresado no cambia de plantel', async () => {
    await alta('3100005').expect(201);
    const estatus = (valor: string) =>
      http().put('/alumnos/3100005/estatus').set('Authorization', control).send({ estatus: valor });
    await estatus('baja').expect(200);
    await estatus('activo').expect(200);
    expect((await estatus('egresado').expect(200)).body.estatus).toBe('egresado');
    expect((await estatus('activo').expect(409)).body.codigo).toBe('TRANSICION_INVALIDA');
    const cambio = await http()
      .put('/alumnos/3100005/facultad')
      .set('Authorization', control)
      .send({ facultadClave: 'FSD' });
    expect(cambio.status).toBe(409);
    expect(cambio.body.codigo).toBe('EXPEDIENTE_NO_ACTIVO');
    const asientos = await prisma.bitacora.findMany({
      where: { entidad: 'alumno:3100005', accion: 'cambio_estatus' },
      orderBy: { id: 'asc' },
    });
    expect(asientos.map((a) => a.valorAnterior)).toEqual([
      { estatus: 'activo' },
      { estatus: 'baja' },
      { estatus: 'activo' },
    ]);
  });

  it('valida la entrada: matricula, facultad existente y cuenta de alumno', async () => {
    expect((await alta('12345').expect(400)).body.campos).toEqual(['matricula']);
    expect((await alta('3100006', { facultadClave: 'NO-EXISTE' }).expect(400)).body.codigo).toBe(
      'REFERENCIA_INEXISTENTE',
    );
    expect((await alta('3100006', { correo: 'caja@sce.test' }).expect(409)).body.codigo).toBe('CUENTA_NO_ALUMNO');
    expect((await alta('3100006', { correo: 'nadie@sce.test' }).expect(409)).body.codigo).toBe('CUENTA_NO_ALUMNO');
    await http().get('/alumnos/abc').set('Authorization', control).expect(400);
    await http().get('/alumnos/0000000').set('Authorization', control).expect(404);
    await http()
      .put('/alumnos/2420001/facultad')
      .set('Authorization', control)
      .send({ facultadClave: 'CUTG' })
      .expect(409);
  });

  it('vincula una cuenta de alumno, con bitacora; una cuenta ya vinculada se rechaza', async () => {
    await prisma.usuario.create({
      data: { correo: 'por.vincular@sce.test', hashContrasena: 'x', roles: { create: { rolId: 1 } } },
    });
    await alta('3100007').expect(201);
    const res = await http()
      .put('/alumnos/3100007/cuenta')
      .set('Authorization', control)
      .send({ correo: 'POR.VINCULAR@sce.test' })
      .expect(200);
    expect(res.body.correo).toBe('por.vincular@sce.test');
    const asiento = await prisma.bitacora.findFirstOrThrow({
      where: { entidad: 'alumno:3100007', accion: 'vinculo_cuenta' },
    });
    expect(asiento.valorAnterior).toEqual({ correo: null });
    await alta('3100008').expect(201);
    expect(
      (
        await http()
          .put('/alumnos/3100008/cuenta')
          .set('Authorization', control)
          .send({ correo: 'por.vincular@sce.test' })
      ).body.codigo,
    ).toBe('YA_EXISTE');
  });

  it('busqueda por matricula o nombre, con solo los datos necesarios (Tabla 38, minimizacion)', async () => {
    const porMatricula = await http().get('/alumnos?buscar=24200').set('Authorization', control).expect(200);
    expect(porMatricula.body.length).toBeGreaterThanOrEqual(10);
    expect(Object.keys(porMatricula.body[0]).sort()).toEqual(['estatus', 'facultadClave', 'matricula', 'nombre']);
    const porNombre = await http().get('/alumnos?buscar=sintético dos').set('Authorization', control).expect(200);
    expect(porNombre.body.map((a: { matricula: string }) => a.matricula)).toEqual(['2420002']);
  });
});

describe('CS-SEG-03: el token de un alumno no accede al expediente de otro', () => {
  it('cada alumno ve solo el suyo, y la matricula sale de su sesion', async () => {
    const uno = await entrar(app, 'alumno@sce.test');
    const dos = await entrar(app, 'alumno.dos@sce.test');
    expect((await http().get('/alumnos/actual').set('Authorization', uno).expect(200)).body.matricula).toBe('2420001');
    expect((await http().get('/alumnos/actual').set('Authorization', dos).expect(200)).body.matricula).toBe('2420002');
    for (const ruta of ['/alumnos/2420002', '/alumnos/2420001', '/alumnos', '/alumnos?buscar=2420002']) {
      expect((await http().get(ruta).set('Authorization', uno)).status).toBe(403);
    }
  });

  it('un alumno sin expediente vinculado recibe la causa y que hacer', async () => {
    await prisma.usuario.create({
      data: {
        correo: 'sin.expediente@sce.test',
        hashContrasena: (await prisma.usuario.findUniqueOrThrow({ where: { correo: 'alumno@sce.test' } }))
          .hashContrasena,
        roles: { create: { rolId: 1 } },
      },
    });
    const token = await entrar(app, 'sin.expediente@sce.test');
    const res = await http().get('/alumnos/actual').set('Authorization', token).expect(404);
    expect(res.body).toMatchObject({ codigo: 'SIN_EXPEDIENTE', mensaje: expect.stringContaining('control escolar') });
  });
});

describe('CS-SEG-02: caja no modifica el historial academico', () => {
  it('ninguna ruta de la API escribe el historial, y caja no escribe expedientes', async () => {
    const caja = await entrar(app, 'caja@sce.test');
    for (const [ruta, cuerpo] of [
      ['/alumnos/2420001/facultad', { facultadClave: 'FSD' }],
      ['/alumnos/2420001/estatus', { estatus: 'baja' }],
      ['/alumnos/2420001/cuenta', { correo: 'alumno@sce.test' }],
    ] as const) {
      expect((await http().put(ruta).set('Authorization', caja).send(cuerpo)).status).toBe(403);
    }
    const contrato = JSON.parse(readFileSync('../docs/api/openapi.json', 'utf8')) as { paths: Record<string, object> };
    expect(Object.keys(contrato.paths).filter((ruta) => ruta.includes('historial'))).toEqual([]);
  });
});

describe('CS-SEG-06 en cambio de plantel: consulta SQL de verificacion', () => {
  it('cero filas tras los cambios hechos por la API', async () => {
    expect(await prisma.$queryRawUnsafe<unknown[]>(consultaCsSeg06)).toEqual([]);
  });

  it('detecta un asiento que no corresponde a un cambio real', async () => {
    const control = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'control.escolar@sce.test' } });
    await prisma.bitacora.create({
      data: {
        autor: control.id,
        accion: 'cambio_plantel',
        entidad: 'alumno:2420004',
        valorAnterior: { facultadClave: 'CUTG' },
      },
    });
    const filas = await prisma.$queryRawUnsafe<{ matricula: string }[]>(consultaCsSeg06);
    expect(filas.map((f) => f.matricula)).toEqual(['2420004']);
  });
});
