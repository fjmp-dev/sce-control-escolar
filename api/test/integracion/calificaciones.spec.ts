// RF-004 y RF-005 en la API (Batch 8): CF-CAL-01 y CI-CAL-01 (Supertest), CS-SEG-01, 02 y 06 en calificacion, el inicio
// del curso (CC-019), el cierre con D-16, CD-DAT-02 sobre 30 expedientes y la correccion posterior al cierre (D-17).
// Cada prueba arma su periodo, sus grupos y sus alumnos: no depende del seed ni del orden de las pruebas.
import { readFileSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { crearApp, crearCuenta, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
let coordinacion: string;
let profesor: string;
let ajeno: string;
let profesorId: string;
let n = 0;
let m = 0;
const http = () => request(app.getHttpServer());
const consulta = (nombre: string) => readFileSync(`prisma/verificacion/${nombre}.sql`, 'utf8');

interface Escenario {
  clave: string;
  grupos: { id: number; materiaClave: string }[];
  alumnos: { matricula: string; folio: string; correo: string }[];
}

/** Un periodo propio con un grupo del profesor por materia y los alumnos inscritos, con su carga confirmada. */
async function escenario(
  opciones: { alumnos?: number; materias?: string[]; estado?: string; anio?: number } = {},
): Promise<Escenario> {
  n += 1;
  const anio = opciones.anio ?? 2500 + n;
  const clave = `${anio}B`;
  const estado = opciones.estado ?? 'en_curso';
  await prisma.periodo.upsert({
    where: { clave },
    update: {},
    create: {
      clave,
      fechaInicio: new Date(`${anio}-08-03`),
      fechaFin: new Date(`${anio}-12-18`),
      estado,
      ofertaPublicadaEn: new Date(),
    },
  });
  const materias = opciones.materias ?? [`C-${n}`];
  const total = opciones.alumnos ?? 1;
  const grupos = [];
  for (const materiaClave of materias) {
    await prisma.materia.upsert({
      where: { clave: materiaClave },
      update: {},
      create: { clave: materiaClave, nombre: `Materia ${materiaClave}`, creditos: 8, planClave: 'ISW-2024' },
    });
    const grupo = await prisma.grupo.create({
      data: {
        clave: `G-${n}-${materiaClave}`,
        materiaClave,
        periodoClave: clave,
        profesorId,
        cupo: 50,
        ocupacion: total,
      },
    });
    grupos.push({ id: Number(grupo.id), materiaClave });
  }
  const alumnos = [];
  for (let i = 0; i < total; i += 1) {
    m += 1;
    const matricula = `${3500000 + m}`;
    const correo = `cal${m}@sce.test`;
    const cuenta = await crearCuenta(prisma, correo);
    await prisma.alumno.create({
      data: {
        matricula,
        nombre: `Alumno Sintético ${m}`,
        facultadClave: 'CUTG',
        fechaIngreso: new Date('2025-08-04'),
        estatus: 'activo',
        usuarioId: cuenta.id,
        historial: { create: {} },
        cuenta: { create: {} },
      },
    });
    alumnos.push({ matricula, folio: `INS-${clave}-${matricula}`, correo });
  }
  return { clave, grupos, alumnos: await inscribir(clave, grupos, alumnos) };
}

/** Inscribe a los alumnos dados en los grupos, con la carga confirmada. */
async function inscribir(
  clave: string,
  grupos: Escenario['grupos'],
  alumnos: Omit<Escenario['alumnos'][number], 'folio'>[],
) {
  const inscritos = [];
  for (const a of alumnos) {
    const folio = `INS-${clave}-${a.matricula}`;
    await prisma.inscripcion.create({
      data: {
        folio,
        matricula: a.matricula,
        periodoClave: clave,
        estado: 'confirmada',
        grupos: { create: grupos.map((g) => ({ grupoId: g.id })) },
      },
    });
    inscritos.push({ ...a, folio });
  }
  return inscritos;
}

const capturar = (token: string, grupoId: number, parcial: number, calificaciones: [string, number][]) =>
  http()
    .put(`/grupos/${grupoId}/calificaciones`)
    .set('Authorization', token)
    .send({ parcial, calificaciones: calificaciones.map(([folio, valor]) => ({ folio, valor })) });
const cerrar = (clave: string, token = coordinacion) =>
  http().post(`/periodos/${clave}/cierre`).set('Authorization', token);
const historial = (matricula: string) => prisma.historial.findUniqueOrThrow({ where: { matricula } });
const asientos = (entidad: string) => prisma.bitacora.findMany({ where: { entidad }, orderBy: { id: 'asc' } });
const calificacion = (folio: string, grupoId: number, parcial: number) =>
  prisma.calificacion.findUniqueOrThrow({
    where: { folio_grupoId_parcial: { folio, grupoId: BigInt(grupoId), parcial } },
  });

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  coordinacion = await entrar(app, 'coordinacion@sce.test');
  profesor = await entrar(app, 'profesor@sce.test');
  ajeno = await entrar(app, 'profesor2@sce.test');
  profesorId = (await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor@sce.test' } })).id;
});

afterAll(() => app.close());

describe('Iniciar el curso (CC-019): termina la inscripcion y empieza la captura', () => {
  it('abierto y publicado pasa a en curso, una sola vez y con bitacora', async () => {
    const { clave } = await escenario({ estado: 'abierto' });
    const res = await http().post(`/periodos/${clave}/inicio`).set('Authorization', coordinacion).expect(200);
    expect(res.body).toMatchObject({ clave, estado: 'en_curso' });
    expect(await asientos(`periodo:${clave}`)).toEqual([expect.objectContaining({ accion: 'iniciar_curso' })]);
    const otraVez = await http().post(`/periodos/${clave}/inicio`).set('Authorization', coordinacion).expect(409);
    expect(otraVez.body.codigo).toBe('PERIODO_NO_ABIERTO');
  });

  it('sin la oferta publicada no se inicia', async () => {
    const { clave } = await escenario({ estado: 'abierto' });
    await prisma.periodo.update({ where: { clave }, data: { ofertaPublicadaEn: null } });
    const res = await http().post(`/periodos/${clave}/inicio`).set('Authorization', coordinacion).expect(409);
    expect(res.body.codigo).toBe('OFERTA_NO_PUBLICADA');
  });
});

describe('CF-CAL-01 y CI-CAL-01: captura solo en grupos asignados y consulta al momento', () => {
  it('R-10: el profesor captura en su grupo y el alumno ve la calificacion en cuanto se confirma la transaccion', async () => {
    const { grupos, alumnos } = await escenario();
    const [{ folio, correo }] = alumnos;
    const res = await capturar(profesor, grupos[0].id, 1, [[folio, 8.75]]).expect(200);
    expect(res.body.alumnos).toEqual([
      expect.objectContaining({
        folio,
        calificaciones: [{ id: expect.any(Number), parcial: 1, valor: 8.75, fechaCaptura: expect.any(String) }],
      }),
    ]);
    expect(res.body.parciales).toEqual([1]);

    const tokenDelAlumno = await entrar(app, correo);
    const propias = await http().get('/alumnos/actual/calificaciones').set('Authorization', tokenDelAlumno);
    expect(propias.status).toBe(200);
    expect(propias.body.materias).toEqual([
      expect.objectContaining({
        materiaClave: grupos[0].materiaClave,
        estadoPeriodo: 'en_curso',
        parciales: [expect.objectContaining({ parcial: 1, valor: 8.75 })],
        final: null,
        acreditada: null,
      }),
    ]);

    const guardada = await calificacion(folio, grupos[0].id, 1);
    expect(guardada.profesorId).toBe(profesorId); // Tabla 16, Credibilidad
    expect(await asientos(`calificacion:${guardada.id}`)).toEqual([
      expect.objectContaining({ autor: profesorId, accion: 'captura_calificacion', valorAnterior: null }),
    ]);
  });

  it('R-09: otro profesor no captura ni consulta el grupo, ni averigua quien esta inscrito', async () => {
    const { grupos, alumnos } = await escenario();
    const res = await capturar(ajeno, grupos[0].id, 1, [[alumnos[0].folio, 10]]).expect(403);
    expect(res.body.codigo).toBe('GRUPO_NO_ASIGNADO');
    const sinInscrito = await capturar(ajeno, grupos[0].id, 1, [['INS-NO-EXISTE', 10]]).expect(403);
    expect(sinInscrito.body.codigo).toBe('GRUPO_NO_ASIGNADO');
    await http().get(`/grupos/${grupos[0].id}/calificaciones`).set('Authorization', ajeno).expect(403);
    expect(await prisma.calificacion.count({ where: { grupoId: BigInt(grupos[0].id) } })).toBe(0);
  });

  it('CS-SEG-01: un alumno no captura, ni siquiera en su propio grupo', async () => {
    const { grupos, alumnos } = await escenario();
    const token = await entrar(app, alumnos[0].correo);
    const res = await capturar(token, grupos[0].id, 1, [[alumnos[0].folio, 10]]).expect(403);
    expect(res.body.codigo).toBe('SIN_PERMISO');
    expect(await prisma.calificacion.count({ where: { folio: alumnos[0].folio } })).toBe(0);
  });

  it('R-21: cambiar una calificacion deja autor, accion, valor anterior y fecha en bitacora; repetir el mismo valor no deja asiento', async () => {
    const { grupos, alumnos } = await escenario();
    const [{ folio }] = alumnos;
    await capturar(profesor, grupos[0].id, 1, [[folio, 7]]).expect(200);
    await capturar(profesor, grupos[0].id, 1, [[folio, 8]]).expect(200);
    await capturar(profesor, grupos[0].id, 1, [[folio, 8]]).expect(200);
    const guardada = await calificacion(folio, grupos[0].id, 1);
    expect(Number(guardada.valor)).toBe(8);
    const lista = await asientos(`calificacion:${guardada.id}`);
    expect(lista).toHaveLength(2);
    expect(lista[1]).toMatchObject({
      autor: profesorId,
      accion: 'captura_calificacion',
      valorAnterior: { valor: 7, profesorId },
      fecha: expect.any(Date),
    });
  });

  it('D-6: fuera de la ventana de captura, 409, con el periodo abierto o cerrado', async () => {
    const abierto = await escenario({ estado: 'abierto' });
    const res = await capturar(profesor, abierto.grupos[0].id, 1, [[abierto.alumnos[0].folio, 9]]).expect(409);
    expect(res.body.codigo).toBe('FUERA_DE_VENTANA');
    const cerrado = await escenario({ estado: 'cerrado' });
    await prisma.inscripcion.update({ where: { folio: cerrado.alumnos[0].folio }, data: { estado: 'cerrada' } });
    const tarde = await capturar(profesor, cerrado.grupos[0].id, 1, [[cerrado.alumnos[0].folio, 9]]).expect(409);
    expect(tarde.body.codigo).toBe('FUERA_DE_VENTANA');
  });

  it('entradas invalidas: alumno de otro grupo, repetido, fuera de rango, tres decimales, parcial 5 o grupo inexistente', async () => {
    const { grupos, alumnos } = await escenario({ alumnos: 2 });
    const otro = await escenario();
    const [a, b] = alumnos.map((x) => x.folio);
    const grupo = grupos[0].id;
    expect((await capturar(profesor, grupo, 1, [[otro.alumnos[0].folio, 9]]).expect(400)).body.codigo).toBe(
      'ALUMNO_NO_INSCRITO',
    );
    expect(
      (
        await capturar(profesor, grupo, 1, [
          [a, 9],
          [a, 8],
        ]).expect(400)
      ).body.codigo,
    ).toBe('CAPTURA_DUPLICADA');
    for (const valor of [-0.01, 10.01, 7.555, Number.NaN]) await capturar(profesor, grupo, 1, [[a, valor]]).expect(400);
    await capturar(profesor, grupo, 5, [[a, 9]]).expect(400);
    await capturar(profesor, grupo, 0, [[a, 9]]).expect(400);
    await capturar(profesor, 999_999_999, 1, [[a, 9]]).expect(404);
    await http().put(`/grupos/${grupo}/calificaciones`).set('Authorization', profesor).send({ parcial: 1 }).expect(400);
    // Los limites del rango son validos.
    await capturar(profesor, grupo, 1, [
      [a, 0],
      [b, 10],
    ]).expect(200);
    expect(await prisma.calificacion.count({ where: { grupoId: BigInt(grupo) } })).toBe(2);
  });
});

describe('Cierre del periodo (RF-005, UC06, D-16)', () => {
  it('con parciales incompletos se rechaza, dice que grupo falta y no cambia nada', async () => {
    const { clave, grupos, alumnos } = await escenario({ alumnos: 2 });
    const [a, b] = alumnos.map((x) => x.folio);
    await capturar(profesor, grupos[0].id, 1, [
      [a, 8],
      [b, 9],
    ]).expect(200);
    await capturar(profesor, grupos[0].id, 2, [[a, 7]]).expect(200);
    const res = await cerrar(clave).expect(409);
    expect(res.body.codigo).toBe('CIERRE_INCOMPLETO');
    expect(res.body.mensaje).toContain(`Materia ${grupos[0].materiaClave}`);
    expect((await prisma.periodo.findUniqueOrThrow({ where: { clave } })).estado).toBe('en_curso');
    expect((await prisma.inscripcion.findUniqueOrThrow({ where: { folio: a } })).estado).toBe('confirmada');
    expect(await asientos(`periodo:${clave}`)).toEqual([]);
  });

  it('R-12 y R-13: completo: periodo cerrado, cargas cerradas, historial recalculado con bitacora, y ya no se captura', async () => {
    const { clave, grupos, alumnos } = await escenario({ alumnos: 2 });
    const [a, b] = alumnos;
    await capturar(profesor, grupos[0].id, 1, [
      [a.folio, 8.5],
      [b.folio, 5],
    ]).expect(200);
    await capturar(profesor, grupos[0].id, 2, [
      [a.folio, 7],
      [b.folio, 6.5],
    ]).expect(200);
    const res = await cerrar(clave).expect(200);
    expect(res.body).toEqual({ clave, estado: 'cerrado', alumnos: 2 });

    // D-5: 7.75 y 5.75; D-8: 8 de 400 creditos es 2 %.
    expect(await historial(a.matricula)).toMatchObject({ creditosAcumulados: 8 });
    expect(Number((await historial(a.matricula)).promedio)).toBe(7.75);
    expect(Number((await historial(a.matricula)).avance)).toBe(2);
    expect(Number((await historial(b.matricula)).promedio)).toBe(5.75);
    expect((await historial(b.matricula)).creditosAcumulados).toBe(0);
    expect((await asientos(`historial:${a.matricula}`))[0]).toMatchObject({
      accion: 'recalcular_historial',
      valorAnterior: { promedio: 0, creditosAcumulados: 0, avance: 0 },
    });
    expect(await asientos(`periodo:${clave}`)).toEqual([expect.objectContaining({ accion: 'cerrar_periodo' })]);
    expect((await prisma.inscripcion.findUniqueOrThrow({ where: { folio: a.folio } })).estado).toBe('cerrada');

    const kardex = await http().get(`/alumnos/${a.matricula}/calificaciones`).set('Authorization', coordinacion);
    expect(kardex.body.materias).toEqual([
      expect.objectContaining({ estadoPeriodo: 'cerrado', final: 7.75, acreditada: true, vigente: true }),
    ]);
    expect(kardex.body.historial).toEqual({ promedio: 7.75, creditosAcumulados: 8, avance: 2 });

    expect((await capturar(profesor, grupos[0].id, 3, [[a.folio, 10]]).expect(409)).body.codigo).toBe(
      'FUERA_DE_VENTANA',
    );
    expect((await cerrar(clave).expect(409)).body.codigo).toBe('PERIODO_NO_EN_CURSO');
  });

  it('R-24 y CS-SEG-02: caja y direccion no cierran periodos ni corrigen calificaciones', async () => {
    const { clave } = await escenario();
    for (const cuenta of ['caja@sce.test', 'direccion@sce.test']) {
      const token = await entrar(app, cuenta);
      await cerrar(clave, token).expect(403);
      await http()
        .put('/calificaciones/1/correccion')
        .set('Authorization', token)
        .send({ valor: 10, motivo: 'x', evidencia: 'y' })
        .expect(403);
    }
  });

  it('el cierre espera a una captura en curso y la ve: si deja parciales a medias, no cierra (D-16)', async () => {
    const { clave, grupos, alumnos } = await escenario({ alumnos: 2 });
    const [a, b] = alumnos.map((x) => x.folio);
    await capturar(profesor, grupos[0].id, 1, [
      [a, 6],
      [b, 7],
    ]).expect(200);
    let terminar = () => {};
    // Una captura a medias: tiene el periodo compartido y el parcial 2 de un solo alumno, sin confirmar.
    const enCurso = prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT clave FROM periodo WHERE clave = ${clave} FOR SHARE`;
        const { id } = await tx.calificacion.create({
          data: { folio: a, grupoId: BigInt(grupos[0].id), profesorId, periodoClave: clave, parcial: 2, valor: 10 },
        });
        await tx.bitacora.create({
          data: { autor: profesorId, accion: 'captura_calificacion', entidad: `calificacion:${id}` },
        });
        await new Promise<void>((resolver) => (terminar = resolver));
      },
      { timeout: 20_000 },
    );
    const cierre = cerrar(clave).then((res) => res);
    await new Promise((resolver) => setTimeout(resolver, 500));
    terminar();
    await enCurso;
    // Si el cierre leyera las calificaciones antes de tomar el periodo, cerraria con el parcial 2 incompleto.
    const res = await cierre;
    expect(res.status).toBe(409);
    expect(res.body.codigo).toBe('CIERRE_INCOMPLETO');
    expect((await prisma.periodo.findUniqueOrThrow({ where: { clave } })).estado).toBe('en_curso');
  });
});

describe('R-12 y R-13, CD-DAT-02 (Tabla 39, AU-23): recalculo independiente sobre 30 expedientes', () => {
  it('el historial de 30 alumnos, con reprobadas y recursadas, coincide con el recalculo en SQL', async () => {
    const materias = [`R-${n + 1}-1`, `R-${n + 1}-2`];
    const primero = await escenario({ alumnos: 30, materias });
    const valor = (k: number, parcial: number, grupo: number) => ((k * 37 + parcial * 11 + grupo * 7) % 41) / 4;
    for (const [g, grupo] of primero.grupos.entries()) {
      for (const parcial of [1, 2]) {
        await capturar(
          profesor,
          grupo.id,
          parcial,
          primero.alumnos.map((a, k): [string, number] => [a.folio, valor(k, parcial, g)]),
        ).expect(200);
      }
    }
    await cerrar(primero.clave).expect(200);

    // Diez recursan la primera materia en un periodo posterior; cuenta el ultimo intento (D-5).
    n += 1;
    const anio = 2600 + n;
    const segundo = { clave: `${anio}B` };
    await prisma.periodo.create({
      data: {
        clave: segundo.clave,
        fechaInicio: new Date(`${anio}-08-03`),
        fechaFin: new Date(`${anio}-12-18`),
        estado: 'en_curso',
        ofertaPublicadaEn: new Date(),
      },
    });
    const grupo = await prisma.grupo.create({
      data: {
        clave: `GR-${n}`,
        materiaClave: materias[0],
        periodoClave: segundo.clave,
        profesorId,
        cupo: 50,
        ocupacion: 10,
      },
    });
    const recursan = await inscribir(
      segundo.clave,
      [{ id: Number(grupo.id), materiaClave: materias[0] }],
      primero.alumnos.slice(0, 10),
    );
    await capturar(
      profesor,
      Number(grupo.id),
      1,
      recursan.map((a, k): [string, number] => [a.folio, (k * 3) % 11]),
    ).expect(200);
    await cerrar(segundo.clave).expect(200);

    const nuestras = new Set(primero.alumnos.map((a) => a.matricula));
    const filas = await prisma.$queryRawUnsafe<{ matricula: string }[]>(consulta('cd-dat-02'));
    expect(filas.filter((f) => nuestras.has(f.matricula))).toEqual([]);
    const conPromedio = await prisma.historial.count({
      where: { matricula: { in: [...nuestras] }, promedio: { gt: 0 } },
    });
    expect(conPromedio).toBeGreaterThanOrEqual(29);

    // Un historial alterado a mano se detecta.
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.historial.update({
          where: { matricula: primero.alumnos[5].matricula },
          data: { promedio: { increment: 0.01 } },
        });
        const alterado = await tx.$queryRawUnsafe<{ matricula: string }[]>(consulta('cd-dat-02'));
        expect(alterado.map((f) => f.matricula)).toContain(primero.alumnos[5].matricula);
        throw new Error('revertir');
      }),
    ).rejects.toThrow('revertir');
  });
});

describe('R-21: correccion posterior al cierre (D-17; PA-SCE-001, Parte B) y CS-SEG-06 en calificacion', () => {
  it('coordinacion corrige con motivo y evidencia: bitacora completa, profesor de origen y historial recalculado', async () => {
    const { clave, grupos, alumnos } = await escenario();
    const [{ folio, matricula }] = alumnos;
    await capturar(profesor, grupos[0].id, 1, [[folio, 5]]).expect(200);
    await cerrar(clave).expect(200);
    expect((await historial(matricula)).creditosAcumulados).toBe(0);
    const { id } = await calificacion(folio, grupos[0].id, 1);

    const res = await http()
      .put(`/calificaciones/${id}/correccion`)
      .set('Authorization', coordinacion)
      .send({ valor: 7, motivo: 'Error de captura del profesor', evidencia: 'Oficio CA-2026-014' })
      .expect(200);
    expect(res.body.historial).toEqual({ promedio: 7, creditosAcumulados: 8, avance: 2 });
    const corregida = await calificacion(folio, grupos[0].id, 1);
    expect(Number(corregida.valor)).toBe(7);
    expect(corregida.profesorId).toBe(profesorId);
    const [, correccion] = await asientos(`calificacion:${id}`);
    expect(correccion).toMatchObject({
      accion: 'correccion_calificacion',
      valorAnterior: { valor: 5, motivo: 'Error de captura del profesor', evidencia: 'Oficio CA-2026-014' },
    });

    const problemas = await prisma.$queryRawUnsafe<{ calificacion: string }[]>(consulta('cs-seg-06-calificacion'));
    expect(problemas.filter((p) => p.calificacion === String(id))).toEqual([]);
  });

  it('sin motivo o evidencia 400; mismo valor 409; periodo en curso 409; el profesor no corrige', async () => {
    const enCurso = await escenario();
    await capturar(profesor, enCurso.grupos[0].id, 1, [[enCurso.alumnos[0].folio, 8]]).expect(200);
    const { id } = await calificacion(enCurso.alumnos[0].folio, enCurso.grupos[0].id, 1);
    const corregir = (cuerpo: object, token = coordinacion) =>
      http().put(`/calificaciones/${id}/correccion`).set('Authorization', token).send(cuerpo);
    const valido = { valor: 9, motivo: 'm', evidencia: 'e' };
    expect((await corregir(valido).expect(409)).body.codigo).toBe('PERIODO_NO_CERRADO');
    await corregir({ valor: 9, motivo: 'm' }).expect(400);
    await corregir({ valor: 9, evidencia: 'e' }).expect(400);
    await corregir(valido, profesor).expect(403);
    await cerrar(enCurso.clave).expect(200);
    expect((await corregir({ ...valido, valor: 8 }).expect(409)).body.codigo).toBe('SIN_CAMBIO');
    await http()
      .put('/calificaciones/999999999/correccion')
      .set('Authorization', coordinacion)
      .send(valido)
      .expect(404);
  });

  it('la consulta detecta una calificacion sin asiento y una captura firmada por quien no es el profesor del grupo', async () => {
    const { clave, grupos, alumnos } = await escenario();
    const ajenoId = (await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor2@sce.test' } })).id;
    await expect(
      prisma.$transaction(async (tx) => {
        const sinAsiento = await tx.calificacion.create({
          data: {
            folio: alumnos[0].folio,
            grupoId: BigInt(grupos[0].id),
            profesorId,
            periodoClave: clave,
            parcial: 1,
            valor: 9,
          },
        });
        const firmada = await tx.calificacion.create({
          data: {
            folio: alumnos[0].folio,
            grupoId: BigInt(grupos[0].id),
            profesorId,
            periodoClave: clave,
            parcial: 2,
            valor: 9,
          },
        });
        await tx.bitacora.create({
          data: { autor: ajenoId, accion: 'captura_calificacion', entidad: `calificacion:${firmada.id}` },
        });
        const problemas = await tx.$queryRawUnsafe<{ calificacion: string; problema: string }[]>(
          consulta('cs-seg-06-calificacion'),
        );
        const propios = problemas.filter((p) => [String(sinAsiento.id), String(firmada.id)].includes(p.calificacion));
        expect(propios.map((p) => p.problema).sort()).toEqual([
          'calificacion sin asiento de captura',
          'captura de alguien que no es el profesor del grupo',
        ]);
        throw new Error('revertir');
      }),
    ).rejects.toThrow('revertir');
  });
});
