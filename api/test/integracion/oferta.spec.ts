// RF-003 en la API (Batch 7): abrir periodo, definir grupos sin traslape de aula ni de profesor (D-13), publicar la
// oferta (CC-012, Fig. 7) y consultarla segun el rol (Tabla 4). CS-SEG-03 sobre la oferta. Cada prueba usa su periodo.
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { crearApp, crearCuenta, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
let coordinacion: string;
let n = 0;
const http = () => request(app.getHttpServer());

/** Un periodo propio de cada prueba, abierto por coordinacion a traves de la API. */
async function periodo() {
  n += 1;
  const clave = `${2400 + n}A`;
  await http()
    .post('/periodos')
    .set('Authorization', coordinacion)
    .send({ clave, fechaInicio: `${2400 + n}-01-10`, fechaFin: `${2400 + n}-06-30` })
    .expect(201);
  return clave;
}

type Sesion = [dia: number, inicio: string, fin: string, aula: string];
const definir = (periodoClave: string, clave: string, horarios: Sesion[], extra: Record<string, unknown> = {}) =>
  http()
    .post('/grupos')
    .set('Authorization', coordinacion)
    .send({
      periodoClave,
      clave,
      materiaClave: 'ISW-101',
      profesor: 'profesor@sce.test',
      cupo: 25,
      horarios: horarios.map(([dia, horaInicio, horaFin, aula]) => ({ dia, horaInicio, horaFin, aula })),
      ...extra,
    });
const asientos = (entidad: string) => prisma.bitacora.findMany({ where: { entidad }, orderBy: { id: 'asc' } });

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  coordinacion = await entrar(app, 'coordinacion@sce.test');
});

afterAll(() => app.close());

describe('Abrir periodo (Fig. 3, Periodo.abrir; Fig. 7)', () => {
  it('nace abierto y sin oferta publicada, con bitacora; el estado no se elige', async () => {
    const clave = await periodo();
    const guardado = await prisma.periodo.findUniqueOrThrow({ where: { clave } });
    expect(guardado).toMatchObject({ estado: 'abierto', ofertaPublicadaEn: null });
    const [asiento] = await asientos(`periodo:${clave}`);
    expect(asiento).toMatchObject({ accion: 'abrir_periodo' });

    const conEstado = await http()
      .post('/periodos')
      .set('Authorization', coordinacion)
      .send({ clave: '2499B', fechaInicio: '2499-08-01', fechaFin: '2499-12-15', estado: 'cerrado' })
      .expect(400);
    expect(conEstado.body).toMatchObject({ codigo: 'ENTRADA_INVALIDA', campos: ['estado'] });
  });
});

describe('Definir grupos (RF-003, D-13)', () => {
  it('el grupo nace con profesor, cupo, sesiones y ocupacion cero, y queda en bitacora', async () => {
    const clave = await periodo();
    const res = await definir(clave, 'G-1', [
      [1, '07:00', '09:00', 'B1'],
      [3, '07:00', '09:00', 'B1'],
    ]).expect(201);
    expect(res.body).toEqual({
      id: expect.any(Number),
      clave: 'G-1',
      materiaClave: 'ISW-101',
      materiaNombre: 'Programación I',
      creditos: 8,
      cupo: 25,
      ocupacion: 0,
      profesor: 'profesor@sce.test',
      horarios: [
        { dia: 1, horaInicio: '07:00', horaFin: '09:00', aula: 'B1' },
        { dia: 3, horaInicio: '07:00', horaFin: '09:00', aula: 'B1' },
      ],
    });
    const [asiento] = await asientos(`grupo:${res.body.id}`);
    expect(asiento).toMatchObject({ accion: 'alta_grupo' });
  });

  it('aula ocupada en el mismo tramo: 409, aunque se escriba distinto; el grupo no se guarda', async () => {
    const clave = await periodo();
    await definir(clave, 'G-1', [[2, '10:00', '12:00', 'Lab 1']]).expect(201);
    const res = await definir(clave, 'G-2', [[2, '11:00', '13:00', ' lab 1 ']], {
      profesor: 'profesor2@sce.test',
    }).expect(409);
    expect(res.body.codigo).toBe('TRASLAPE_DE_AULA');
    expect(res.body.mensaje).toBe(
      'El aula Lab 1 ya está ocupada el martes de 11:00 a 12:00 por el grupo G-1. Elige otra aula u otro horario.',
    );
    expect(await prisma.grupo.count({ where: { periodoClave: clave } })).toBe(1);
  });

  it('profesor ocupado en el mismo tramo, en otra aula: 409', async () => {
    const clave = await periodo();
    await definir(clave, 'G-1', [[4, '07:00', '09:00', 'B1']]).expect(201);
    const res = await definir(clave, 'G-2', [[4, '08:00', '10:00', 'B2']]).expect(409);
    expect(res.body.codigo).toBe('TRASLAPE_DE_PROFESOR');
  });

  it('valores limite: termina cuando empieza el otro, otro dia, otro periodo u otro profesor y aula no chocan', async () => {
    const clave = await periodo();
    const otro = await periodo();
    await definir(clave, 'G-1', [[5, '07:00', '09:00', 'B1']]).expect(201);
    await definir(clave, 'G-2', [[5, '09:00', '11:00', 'B1']]).expect(201);
    await definir(clave, 'G-3', [[6, '07:00', '09:00', 'B1']]).expect(201);
    await definir(clave, 'G-4', [[5, '07:00', '09:00', 'B2']], { profesor: 'profesor2@sce.test' }).expect(201);
    await definir(otro, 'G-1', [[5, '07:00', '09:00', 'B1']]).expect(201);
    expect(await prisma.grupo.count({ where: { periodoClave: clave } })).toBe(4);
    expect(await prisma.grupo.count({ where: { periodoClave: otro } })).toBe(1);
  });

  it('sesiones del mismo grupo traslapadas o al reves: 400 con su causa', async () => {
    const clave = await periodo();
    const traslapadas = await definir(clave, 'G-1', [
      [1, '07:00', '09:00', 'B1'],
      [1, '08:30', '10:00', 'B2'],
    ]).expect(400);
    expect(traslapadas.body.codigo).toBe('SESIONES_TRASLAPADAS');
    const alReves = await definir(clave, 'G-1', [[1, '09:00', '09:00', 'B1']]).expect(400);
    expect(alReves.body.codigo).toBe('RANGO_INVERTIDO');
  });

  it('el profesor debe ser una cuenta activa con rol de profesor', async () => {
    const clave = await periodo();
    const alumno = await definir(clave, 'G-1', [[1, '07:00', '09:00', 'B1']], { profesor: 'alumno@sce.test' });
    expect(alumno.status).toBe(409);
    expect(alumno.body.codigo).toBe('CUENTA_NO_PROFESOR');
    const inactivo = await crearCuenta(prisma, 'profesor.baja@sce.test', 2);
    await prisma.usuario.update({ where: { id: inactivo.id }, data: { activo: false } });
    const baja = await definir(clave, 'G-1', [[1, '07:00', '09:00', 'B1']], { profesor: 'profesor.baja@sce.test' });
    expect(baja.body.codigo).toBe('CUENTA_NO_PROFESOR');
  });

  it('periodo cerrado o inexistente, materia inexistente y clave repetida se rechazan', async () => {
    const cerrado = await definir('2026B', 'G-9', [[1, '07:00', '09:00', 'B1']]).expect(409);
    expect(cerrado.body.codigo).toBe('PERIODO_NO_ABIERTO');
    expect((await definir('2099B', 'G-9', [[1, '07:00', '09:00', 'B1']]).expect(409)).body.codigo).toBe(
      'PERIODO_NO_ABIERTO',
    );
    const clave = await periodo();
    const materia = await definir(clave, 'G-1', [[1, '07:00', '09:00', 'B1']], { materiaClave: 'NO-EXISTE' });
    expect(materia.body).toMatchObject({ codigo: 'REFERENCIA_INEXISTENTE' });
    await definir(clave, 'G-1', [[1, '07:00', '09:00', 'B1']]).expect(201);
    expect((await definir(clave, 'G-1', [[2, '07:00', '09:00', 'B1']]).expect(409)).body.codigo).toBe('YA_EXISTE');
  });

  it('CS-SEG-03: no se fija la ocupacion ni el id desde la peticion; entradas fuera de rango dan 400', async () => {
    const clave = await periodo();
    const sesion: Sesion = [1, '07:00', '09:00', 'B1'];
    const conOcupacion = await definir(clave, 'G-1', [sesion], { ocupacion: 25 }).expect(400);
    expect(conOcupacion.body.campos).toEqual(['ocupacion']);
    await definir(clave, 'G-1', [sesion], { id: 1 }).expect(400);
    await definir(clave, 'G-1', [[7, '07:00', '09:00', 'B1']]).expect(400);
    await definir(clave, 'G-1', [[1, '7:00', '09:00', 'B1']]).expect(400);
    await definir(clave, 'G-1', [[1, '07:00', '24:00', 'B1']]).expect(400);
    await definir(clave, 'G-1', [[1, '07:00', '09:00', '   ']]).expect(400);
    await definir(clave, 'G-1', [sesion], { cupo: 0 }).expect(400);
    await definir(clave, 'G-1', []).expect(400);
    await definir(
      clave,
      'G-1',
      Array.from({ length: 13 }, (_, i): Sesion => [1, '07:00', '08:00', `X${i}`]),
    ).expect(400);
    expect(await prisma.grupo.count({ where: { periodoClave: clave } })).toBe(0);
  });

  it('RK-05: ocho definiciones simultaneas de la misma aula y hora dejan un solo grupo', async () => {
    const clave = await periodo();
    const resultados = await Promise.all(
      Array.from({ length: 8 }, (_, i) => definir(clave, `G-${i}`, [[3, '16:00', '18:00', 'C1']])),
    );
    expect(resultados.filter((r) => r.status === 201)).toHaveLength(1);
    expect(resultados.filter((r) => r.status === 409)).toHaveLength(7);
    expect(await prisma.grupo.count({ where: { periodoClave: clave } })).toBe(1);
  });

  it('RK-05: una definicion espera a la que esta en curso en el mismo periodo y ve su grupo al terminar', async () => {
    const clave = await periodo();
    const { id: profesorId } = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor@sce.test' } });
    const hora = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`);
    let terminar = () => {};
    const enCurso = prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT clave FROM periodo WHERE clave = ${clave} FOR UPDATE`;
        await tx.grupo.create({
          data: {
            clave: 'G-0',
            materiaClave: 'ISW-101',
            periodoClave: clave,
            profesorId,
            cupo: 30,
            horarios: { create: { dia: 3, horaInicio: hora('16:00'), horaFin: hora('18:00'), aula: 'C1' } },
          },
        });
        await new Promise<void>((resolver) => (terminar = resolver));
      },
      { timeout: 20_000 },
    );
    // Sin el bloqueo, la peticion leeria la oferta sin el grupo G-0, todavia sin confirmar, y lo duplicaria con 201.
    const peticion = definir(clave, 'G-1', [[3, '16:00', '18:00', 'C1']], { profesor: 'profesor2@sce.test' }).then(
      (res) => res,
    );
    await new Promise((resolver) => setTimeout(resolver, 500));
    terminar();
    await enCurso;
    const res = await peticion;
    expect(res.status).toBe(409);
    expect(res.body.codigo).toBe('TRASLAPE_DE_AULA');
  });
});

describe('Publicar la oferta (CC-012) y consultarla segun el rol (Tabla 4)', () => {
  it('el alumno no ve ni inscribe una oferta sin publicar; al publicarse si, una sola vez y con bitacora', async () => {
    const clave = await periodo();
    const grupo = (await definir(clave, 'G-1', [[1, '07:00', '09:00', 'B1']]).expect(201)).body;
    const alumno = await entrar(app, 'alumno@sce.test');

    expect((await http().get(`/grupos?periodo=${clave}`).set('Authorization', alumno).expect(200)).body).toEqual([]);
    const temprano = await http()
      .post('/inscripciones')
      .set('Authorization', alumno)
      .send({ periodoClave: clave, grupos: [grupo.id] })
      .expect(409);
    expect(temprano.body.codigo).toBe('OFERTA_NO_PUBLICADA');
    const completa = await http().get(`/periodos/${clave}/grupos`).set('Authorization', coordinacion).expect(200);
    expect(completa.body).toEqual([grupo]);

    const publicado = await http()
      .post(`/periodos/${clave}/publicacion`)
      .set('Authorization', coordinacion)
      .expect(201);
    expect(publicado.body).toMatchObject({ clave, estado: 'abierto', ofertaPublicadaEn: expect.any(String) });
    const [, asiento] = await asientos(`periodo:${clave}`);
    expect(asiento).toMatchObject({ accion: 'publicar_oferta' });
    const otraVez = await http().post(`/periodos/${clave}/publicacion`).set('Authorization', coordinacion).expect(409);
    expect(otraVez.body.codigo).toBe('OFERTA_YA_PUBLICADA');

    const visible = await http().get(`/grupos?periodo=${clave}`).set('Authorization', alumno).expect(200);
    const { profesor, ...sinProfesor } = grupo;
    expect(profesor).toBe('profesor@sce.test');
    expect(visible.body).toEqual([sinProfesor]);
  });

  it('no se publica la oferta de un periodo cerrado ni de uno inexistente', async () => {
    const cerrado = await http().post('/periodos/2026B/publicacion').set('Authorization', coordinacion).expect(409);
    expect(cerrado.body.codigo).toBe('PERIODO_NO_ABIERTO');
    await http().post('/periodos/2099B/publicacion').set('Authorization', coordinacion).expect(409);
    await http().post('/periodos/NO-EXISTE/publicacion').set('Authorization', coordinacion).expect(400);
  });

  it('el profesor ve solo sus grupos, con su horario y periodo, y no los de periodos cerrados', async () => {
    const clave = await periodo();
    const suyo = (
      await definir(clave, 'P-1', [[2, '15:00', '17:00', 'D1']], { profesor: 'profesor2@sce.test' }).expect(201)
    ).body;
    await definir(clave, 'P-2', [[2, '15:00', '17:00', 'D2']]).expect(201);
    const profesor2 = await entrar(app, 'profesor2@sce.test');
    const res = await http().get('/profesores/actual/grupos').set('Authorization', profesor2).expect(200);
    const { profesor, ...sinProfesor } = suyo;
    expect(profesor).toBe('profesor2@sce.test');
    expect(res.body).toContainEqual({ ...sinProfesor, periodoClave: clave });
    expect(res.body.every((g: { clave: string }) => g.clave !== 'P-2')).toBe(true);
    expect(res.body.every((g: { periodoClave: string }) => g.periodoClave !== '2026B')).toBe(true);

    const titular = await entrar(app, 'profesor@sce.test');
    const delTitular = await http().get('/profesores/actual/grupos').set('Authorization', titular).expect(200);
    expect(delTitular.body.map((g: { periodoClave: string }) => g.periodoClave)).not.toContain('2026B');
    expect(delTitular.body.map((g: { clave: string }) => g.clave)).toContain('P-2');
  });
});
