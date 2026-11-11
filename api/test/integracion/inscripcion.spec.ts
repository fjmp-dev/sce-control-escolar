// CF-INS-01 en la API, CI-API-01 (Tabla 45, Supertest y Testcontainers), CS-SEG-03 sobre la inscripcion, D-6 y D-14.
// Cada prueba crea sus alumnos, materias y grupos: no depende del seed ni del orden de las pruebas.
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { crearApp, crearCuenta, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
let profesorId: string;
let control: string;
let n = 0;
const http = () => request(app.getHttpServer());
const ABIERTO = '2031A';
const CERRADO = '2030B';
const hora = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`);

/** Un grupo con sus horarios: [dia, inicio, fin]. Su materia es nueva salvo que se indique. */
async function grupo(
  horarios: [number, string, string][],
  opciones: { materia?: string; cupo?: number; periodo?: string; ocupacion?: number } = {},
) {
  n += 1;
  const materiaClave = opciones.materia ?? `T-${n}`;
  if (!opciones.materia) {
    await prisma.materia.create({
      data: { clave: materiaClave, nombre: `Materia ${n}`, creditos: 6, planClave: 'ISW-2024' },
    });
  }
  const creado = await prisma.grupo.create({
    data: {
      clave: `G-${n}`,
      materiaClave,
      periodoClave: opciones.periodo ?? ABIERTO,
      profesorId,
      cupo: opciones.cupo ?? 30,
      ocupacion: opciones.ocupacion ?? 0,
      horarios: {
        create: horarios.map(([dia, inicio, fin]) => ({
          dia,
          horaInicio: hora(inicio),
          horaFin: hora(fin),
          aula: 'A1',
        })),
      },
    },
  });
  return { id: Number(creado.id), materiaClave };
}

/** Un alumno con cuenta vinculada. `acreditadas`: materias con calificacion en un periodo cerrado. */
async function alumno(
  opciones: { saldo?: number; acreditadas?: { materia: string; valores: number[] }[]; estatus?: string } = {},
) {
  n += 1;
  const correo = `ins${n}@sce.test`;
  const matricula = `${3200000 + n}`;
  const cuenta = await crearCuenta(prisma, correo);
  await prisma.alumno.create({
    data: {
      matricula,
      nombre: `Alumno ${n}`,
      facultadClave: 'CUTG',
      fechaIngreso: new Date('2025-08-04'),
      estatus: opciones.estatus ?? 'activo',
      usuarioId: cuenta.id,
      historial: { create: {} },
      cuenta: { create: { saldo: opciones.saldo ?? 0 } },
    },
  });
  for (const [i, { materia, valores }] of (opciones.acreditadas ?? []).entries()) {
    const previo = await grupo([[6, '07:00', '08:00']], { materia, periodo: CERRADO, ocupacion: 1 });
    const folio = `PREVIO-${matricula}-${i}`;
    await prisma.inscripcion.create({
      data: { folio, matricula, periodoClave: CERRADO, estado: 'cerrada', grupos: { create: { grupoId: previo.id } } },
    });
    await prisma.calificacion.createMany({
      data: valores.map((valor, p) => ({
        folio,
        grupoId: previo.id,
        profesorId,
        periodoClave: CERRADO,
        parcial: p + 1,
        valor,
      })),
    });
  }
  return { matricula, folio: `INS-${ABIERTO}-${matricula}`, token: await entrar(app, correo), usuarioId: cuenta.id };
}

const inscribir = (token: string, grupos: number[], periodoClave = ABIERTO) =>
  http().post('/inscripciones').set('Authorization', token).send({ periodoClave, grupos });
const ajustar = (token: string, folio: string, grupos: number[]) =>
  http().put(`/inscripciones/${folio}/grupos`).set('Authorization', token).send({ grupos });
const ocupacion = async (id: number) => (await prisma.grupo.findUniqueOrThrow({ where: { id } })).ocupacion;
const guardada = (folio: string) =>
  prisma.inscripcion.findUnique({ where: { folio }, include: { grupos: { orderBy: { grupoId: 'asc' } } } });
const asientos = (folio: string) =>
  prisma.bitacora.findMany({ where: { entidad: `inscripcion:${folio}` }, orderBy: { id: 'asc' } });

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  profesorId = (await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor@sce.test' } })).id;
  await prisma.periodo.createMany({
    data: [
      {
        clave: ABIERTO,
        fechaInicio: new Date('2031-01-13'),
        fechaFin: new Date('2031-06-30'),
        estado: 'abierto',
        ofertaPublicadaEn: new Date(),
      },
      { clave: CERRADO, fechaInicio: new Date('2030-08-05'), fechaFin: new Date('2030-12-20'), estado: 'cerrado' },
      { clave: '2031B', fechaInicio: new Date('2031-08-04'), fechaFin: new Date('2031-12-19'), estado: 'en_curso' },
    ],
  });
  control = await entrar(app, 'control.escolar@sce.test');
});

afterAll(() => app.close());

describe('CF-INS-01: con prerrequisito faltante o adeudo, la carga queda en estado explicito y no se confirma', () => {
  it('R-03 y R-08: prerrequisito faltante: 409 con estado y motivo, el rechazo queda guardado con su carga y en bitacora (CC-013)', async () => {
    const basica = await grupo([[1, '07:00', '09:00']]);
    const avanzada = await grupo([[2, '07:00', '09:00']]);
    await prisma.prerequisito.create({
      data: { materiaClave: avanzada.materiaClave, requiereClave: basica.materiaClave },
    });
    const a = await alumno();

    const res = await inscribir(a.token, [avanzada.id]).expect(409);
    expect(res.body).toEqual({
      codigo: 'INSCRIPCION_RECHAZADA',
      folio: a.folio,
      estado: 'rechazada',
      motivo: 'prerrequisito',
      mensaje: expect.stringMatching(/^Te falta acreditar .*\. Quita esa materia de tu carga/),
    });
    const fila = await guardada(a.folio);
    expect(fila).toMatchObject({ estado: 'rechazada', motivoRechazo: 'prerrequisito', matricula: a.matricula });
    expect(fila?.grupos.map((g) => Number(g.grupoId))).toEqual([avanzada.id]);
    expect(await ocupacion(avanzada.id)).toBe(0);
    expect(await asientos(a.folio)).toMatchObject([
      { accion: 'inscripcion_rechazada', autor: a.usuarioId, valorAnterior: null },
    ]);
  });

  it('con el prerrequisito acreditado en un periodo cerrado se confirma; si su periodo no ha cerrado, no cuenta (D-5)', async () => {
    const basica = await grupo([[1, '07:00', '09:00']]);
    const avanzada = await grupo([[2, '07:00', '09:00']]);
    await prisma.prerequisito.create({
      data: { materiaClave: avanzada.materiaClave, requiereClave: basica.materiaClave },
    });
    const aprobado = await alumno({ acreditadas: [{ materia: basica.materiaClave, valores: [6, 5.99] }] });
    const reprobado = await alumno({ acreditadas: [{ materia: basica.materiaClave, valores: [5.99] }] });

    await inscribir(aprobado.token, [avanzada.id]).expect(201);
    expect((await inscribir(reprobado.token, [avanzada.id]).expect(409)).body.motivo).toBe('prerrequisito');

    const enCurso = await alumno();
    const cursando = await prisma.inscripcion.create({
      data: {
        folio: `CURSO-${enCurso.matricula}`,
        matricula: enCurso.matricula,
        periodoClave: '2031B',
        estado: 'confirmada',
      },
    });
    const g = await grupo([[6, '07:00', '08:00']], { materia: basica.materiaClave, periodo: '2031B', ocupacion: 1 });
    await prisma.inscripcionGrupo.create({ data: { folio: cursando.folio, grupoId: g.id } });
    await prisma.calificacion.create({
      data: { folio: cursando.folio, grupoId: g.id, profesorId, periodoClave: '2031B', parcial: 1, valor: 10 },
    });
    expect((await inscribir(enCurso.token, [avanzada.id]).expect(409)).body.motivo).toBe('prerrequisito');
  });

  it('R-04: adeudo vigente (D-10): 409 por adeudo, con la correccion', async () => {
    const g = await grupo([[3, '07:00', '09:00']]);
    const a = await alumno({ saldo: 0.01 });
    const res = await inscribir(a.token, [g.id]).expect(409);
    expect(res.body).toMatchObject({ motivo: 'adeudo', estado: 'rechazada', mensaje: expect.stringContaining('caja') });
    expect(await ocupacion(g.id)).toBe(0);
  });

  it('R-05: choque de horario: 409 por choque, que dice cuales grupos, que dia y a que hora', async () => {
    const a1 = await grupo([[1, '07:00', '09:00']]);
    const b1 = await grupo([[1, '08:00', '10:00']]);
    const a = await alumno();
    const res = await inscribir(a.token, [a1.id, b1.id]).expect(409);
    expect(res.body.motivo).toBe('choque');
    expect(res.body.mensaje).toMatch(/se traslapan el lunes de 08:00 a 09:00\. Cambia uno de los dos grupos/);
  });

  it('R-07: con prerrequisito, adeudo y choque a la vez, el motivo es el primero del orden fijo', async () => {
    const basica = await grupo([[4, '07:00', '09:00']]);
    const avanzada = await grupo([[1, '07:00', '09:00']]);
    const otra = await grupo([[1, '08:00', '10:00']]);
    await prisma.prerequisito.create({
      data: { materiaClave: avanzada.materiaClave, requiereClave: basica.materiaClave },
    });
    const a = await alumno({ saldo: 500 });
    expect((await inscribir(a.token, [avanzada.id, otra.id]).expect(409)).body.motivo).toBe('prerrequisito');
    const b = await alumno({ saldo: 500 });
    expect((await inscribir(b.token, [otra.id, basica.id]).expect(409)).body.motivo).toBe('adeudo');
  });
});

describe('CI-API-01: la inscripcion confirmada persiste la carga y deja traza; si falla, revierte completa', () => {
  it('201 con folio y comprobante; carga, cupo y bitacora en la misma transaccion', async () => {
    const g1 = await grupo([
      [1, '07:00', '09:00'],
      [3, '07:00', '09:00'],
    ]);
    const g2 = await grupo([[5, '07:00', '10:00']]);
    const a = await alumno();

    const res = await inscribir(a.token, [g2.id, g1.id]).expect(201);
    expect(res.body).toMatchObject({
      folio: a.folio,
      matricula: a.matricula,
      periodoClave: ABIERTO,
      estado: 'confirmada',
      motivoRechazo: null,
      grupos: [
        {
          id: g1.id,
          ocupacion: 1,
          horarios: [{ dia: 1, horaInicio: '07:00', horaFin: '09:00', aula: 'A1' }, { dia: 3 }],
        },
        { id: g2.id, ocupacion: 1 },
      ],
    });
    expect((await guardada(a.folio))?.grupos.map((g) => Number(g.grupoId))).toEqual([g1.id, g2.id]);
    expect([await ocupacion(g1.id), await ocupacion(g2.id)]).toEqual([1, 1]);
    expect(await asientos(a.folio)).toMatchObject([{ accion: 'inscripcion_confirmada', autor: a.usuarioId }]);

    const mias = await http().get('/alumnos/actual/inscripciones').set('Authorization', a.token).expect(200);
    expect(mias.body).toMatchObject([{ folio: a.folio, estado: 'confirmada', grupos: [{ id: g1.id }, { id: g2.id }] }]);
  });

  it('corregir un rechazo reusa la misma inscripcion y la bitacora guarda el estado anterior (Fig. 6)', async () => {
    const g1 = await grupo([[1, '07:00', '09:00']]);
    const g2 = await grupo([[1, '08:00', '10:00']]);
    const a = await alumno();
    await inscribir(a.token, [g1.id, g2.id]).expect(409);
    await inscribir(a.token, [g1.id]).expect(201);

    expect(await prisma.inscripcion.count({ where: { matricula: a.matricula } })).toBe(1);
    expect((await guardada(a.folio))?.grupos.map((g) => Number(g.grupoId))).toEqual([g1.id]);
    expect((await asientos(a.folio)).map((s) => [s.accion, s.valorAnterior])).toEqual([
      ['inscripcion_rechazada', null],
      ['inscripcion_confirmada', { estado: 'rechazada', motivo: 'choque', grupos: [g1.id, g2.id] }],
    ]);
    expect((await inscribir(a.token, [g1.id]).expect(409)).body.codigo).toBe('TRANSICION_INVALIDA');
  });

  it('R-06: si un grupo se queda sin cupo, revierte la reserva de los demas y termina rechazada por cupo', async () => {
    const libre = await grupo([[2, '07:00', '09:00']]);
    const lleno = await grupo([[4, '07:00', '09:00']], { cupo: 1 });
    await inscribir((await alumno()).token, [lleno.id]).expect(201);
    const a = await alumno();

    const res = await inscribir(a.token, [libre.id, lleno.id]).expect(409);
    expect(res.body).toMatchObject({
      motivo: 'cupo',
      estado: 'rechazada',
      mensaje: expect.stringContaining('sin lugares'),
    });
    expect([await ocupacion(libre.id), await ocupacion(lleno.id)]).toEqual([0, 1]);
    expect(await guardada(a.folio)).toMatchObject({ estado: 'rechazada', motivoRechazo: 'cupo' });
  });

  it('R-06 y AMFE modo 2: cinco alumnos a la vez por dos lugares; ni sobrecupo ni lugar perdido', async () => {
    const g = await grupo([[6, '08:00', '10:00']], { cupo: 2 });
    const alumnos = await Promise.all([1, 2, 3, 4, 5].map(() => alumno()));
    const respuestas = await Promise.all(alumnos.map((a) => inscribir(a.token, [g.id])));

    expect(respuestas.map((r) => r.status).sort()).toEqual([201, 201, 409, 409, 409]);
    expect(respuestas.filter((r) => r.status === 409).every((r) => r.body.motivo === 'cupo')).toBe(true);
    expect(await ocupacion(g.id)).toBe(2);
    expect(
      await prisma.inscripcionGrupo.count({ where: { grupoId: g.id, inscripcion: { estado: 'confirmada' } } }),
    ).toBe(2);
  });

  it('AMFE modo 6: un doble envio simultaneo del mismo alumno no duplica la inscripcion ni el cupo', async () => {
    const g = await grupo([[6, '10:00', '12:00']]);
    const a = await alumno();
    const respuestas = await Promise.all([inscribir(a.token, [g.id]), inscribir(a.token, [g.id])]);

    expect(respuestas.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(['INSCRIPCION_CAMBIADA', 'TRANSICION_INVALIDA']).toContain(
      respuestas.find((r) => r.status === 409)?.body.codigo,
    );
    expect(await prisma.inscripcion.count({ where: { matricula: a.matricula } })).toBe(1);
    expect(await ocupacion(g.id)).toBe(1);
  });
});

describe('Fig. 6: ajuste dentro del plazo (D-6)', () => {
  it('alta y baja de grupos: mueve el cupo, conserva el folio y deja asiento con la carga anterior', async () => {
    const queda = await grupo([[1, '11:00', '13:00']]);
    const sale = await grupo([[2, '11:00', '13:00']]);
    const entra = await grupo([[3, '11:00', '13:00']]);
    const a = await alumno();
    await inscribir(a.token, [queda.id, sale.id]).expect(201);

    const res = await ajustar(a.token, a.folio, [queda.id, entra.id]).expect(200);
    expect(res.body).toMatchObject({
      folio: a.folio,
      estado: 'confirmada',
      grupos: [{ id: queda.id }, { id: entra.id }],
    });
    expect([await ocupacion(queda.id), await ocupacion(sale.id), await ocupacion(entra.id)]).toEqual([1, 0, 1]);
    expect((await asientos(a.folio)).at(-1)).toMatchObject({
      accion: 'ajuste_inscripcion',
      valorAnterior: { estado: 'confirmada', grupos: [queda.id, sale.id] },
    });
    expect((await ajustar(a.token, a.folio, [entra.id, queda.id]).expect(409)).body.codigo).toBe('SIN_CAMBIO');
  });

  it('un ajuste que no pasa la revalidacion conserva la carga confirmada y lo dice', async () => {
    const g1 = await grupo([[4, '11:00', '13:00']]);
    const choca = await grupo([[4, '12:00', '14:00']]);
    const a = await alumno();
    await inscribir(a.token, [g1.id]).expect(201);

    const res = await ajustar(a.token, a.folio, [g1.id, choca.id]).expect(409);
    expect(res.body).toMatchObject({
      codigo: 'AJUSTE_RECHAZADO',
      estado: 'confirmada',
      motivo: 'choque',
      folio: a.folio,
    });
    expect(await guardada(a.folio)).toMatchObject({ estado: 'confirmada', motivoRechazo: null });
    expect((await guardada(a.folio))?.grupos.map((g) => Number(g.grupoId))).toEqual([g1.id]);
    expect([await ocupacion(g1.id), await ocupacion(choca.id)]).toEqual([1, 0]);
    expect((await asientos(a.folio)).at(-1)).toMatchObject({ accion: 'ajuste_rechazado' });
  });

  it('fuera de plazo no se inscribe ni se ajusta: el periodo debe estar abierto', async () => {
    const enCurso = await grupo([[5, '11:00', '13:00']], { periodo: '2031B' });
    const a = await alumno();
    expect((await inscribir(a.token, [enCurso.id], '2031B').expect(409)).body.codigo).toBe('PERIODO_NO_ABIERTO');
    expect((await inscribir(a.token, [enCurso.id], '2099A').expect(409)).body.codigo).toBe('PERIODO_NO_ABIERTO');

    const g = await grupo([[5, '14:00', '15:00']]);
    await inscribir(a.token, [g.id]).expect(201);
    await prisma.periodo.update({ where: { clave: ABIERTO }, data: { estado: 'en_curso' } });
    try {
      expect((await ajustar(a.token, a.folio, [enCurso.id]).expect(409)).body.codigo).toBe('PERIODO_NO_ABIERTO');
    } finally {
      await prisma.periodo.update({ where: { clave: ABIERTO }, data: { estado: 'abierto' } });
    }
  });
});

describe('Reglas de la carga y del expediente', () => {
  it.each(['baja', 'egresado'])('un expediente en %s no se inscribe (Fig. 4)', async (estatus) => {
    const g = await grupo([[2, '14:00', '15:00']]);
    const a = await alumno({ estatus });
    expect((await inscribir(a.token, [g.id]).expect(409)).body.codigo).toBe('EXPEDIENTE_NO_ACTIVO');
  });

  it('grupos de otro periodo o inexistentes, materia repetida y carga vacia', async () => {
    const otroPeriodo = await grupo([[2, '15:00', '16:00']], { periodo: CERRADO });
    const g1 = await grupo([[3, '15:00', '16:00']]);
    const mismaMateria = await grupo([[4, '15:00', '16:00']], { materia: g1.materiaClave });
    const a = await alumno();
    expect((await inscribir(a.token, [otroPeriodo.id]).expect(400)).body.codigo).toBe('GRUPO_FUERA_DE_OFERTA');
    expect((await inscribir(a.token, [999999]).expect(400)).body.codigo).toBe('GRUPO_FUERA_DE_OFERTA');
    expect((await inscribir(a.token, [g1.id, mismaMateria.id]).expect(409)).body.codigo).toBe('MATERIA_REPETIDA');
    expect((await inscribir(a.token, []).expect(400)).body.campos).toEqual(['grupos']);
    expect((await inscribir(a.token, [g1.id, g1.id]).expect(400)).body.campos).toEqual(['grupos']);
    expect(await prisma.inscripcion.count({ where: { matricula: a.matricula } })).toBe(0);
  });
});

describe('R-23 y CS-SEG-03: un alumno no inscribe ni ajusta la carga de otro', () => {
  it('la matricula sale de la sesion; un folio ajeno responde 404 y no cambia nada', async () => {
    const g = await grupo([[3, '16:00', '17:00']]);
    const otro = await grupo([[4, '16:00', '17:00']]);
    const duena = await alumno();
    const intrusa = await alumno();
    await inscribir(duena.token, [g.id]).expect(201);

    await ajustar(intrusa.token, duena.folio, [otro.id]).expect(404);
    await ajustar(intrusa.token, 'INS-2031A-NO-EXISTE', [otro.id]).expect(404);
    expect((await guardada(duena.folio))?.grupos.map((x) => Number(x.grupoId))).toEqual([g.id]);
    await http()
      .post('/inscripciones')
      .set('Authorization', intrusa.token)
      .send({ periodoClave: ABIERTO, grupos: [otro.id], matricula: duena.matricula })
      .expect(400);
    expect(await prisma.inscripcion.count({ where: { matricula: duena.matricula } })).toBe(1);
  });

  it('una cuenta de alumno sin expediente no se inscribe', async () => {
    await crearCuenta(prisma, 'sin.expediente.ins@sce.test');
    const token = await entrar(app, 'sin.expediente.ins@sce.test');
    expect((await inscribir(token, [1]).expect(404)).body.codigo).toBe('SIN_EXPEDIENTE');
    expect(
      (await http().get('/alumnos/actual/inscripciones').set('Authorization', token).expect(404)).body.codigo,
    ).toBe('SIN_EXPEDIENTE');
  });
});

describe('D-14 (provisional): control escolar consulta las inscripciones de un alumno', () => {
  it('ve estado, motivo y carga; una matricula inexistente responde 404', async () => {
    const g = await grupo([[5, '16:00', '17:00']]);
    const a = await alumno({ saldo: 10 });
    await inscribir(a.token, [g.id]).expect(409);
    const res = await http().get(`/alumnos/${a.matricula}/inscripciones`).set('Authorization', control).expect(200);
    expect(res.body).toMatchObject([
      { folio: a.folio, estado: 'rechazada', motivoRechazo: 'adeudo', grupos: [{ id: g.id }] },
    ]);
    await http().get('/alumnos/0000001/inscripciones').set('Authorization', control).expect(404);
  });
});

describe('R-05: oferta y aviso de choque antes de enviar (CF-HOR-01)', () => {
  it('la oferta del periodo trae cupo, ocupacion y horarios; la revision de choques no guarda nada', async () => {
    const a1 = await grupo([[6, '13:00', '15:00']]);
    const b1 = await grupo([[6, '14:00', '16:00']]);
    const a = await alumno();
    const oferta = await http().get(`/grupos?periodo=${ABIERTO}`).set('Authorization', a.token).expect(200);
    expect(oferta.body).toEqual(
      expect.arrayContaining([
        {
          id: a1.id,
          clave: expect.any(String),
          materiaClave: a1.materiaClave,
          materiaNombre: expect.any(String),
          creditos: 6,
          cupo: 30,
          ocupacion: 0,
          horarios: [{ dia: 6, horaInicio: '13:00', horaFin: '15:00', aula: 'A1' }],
        },
      ]),
    );
    await http().get('/grupos').set('Authorization', a.token).expect(400);

    const choques = await http()
      .get(`/grupos/choques?grupos=${a1.id}&grupos=${b1.id}`)
      .set('Authorization', a.token)
      .expect(200);
    expect(choques.body).toEqual([
      {
        grupos: [a1.id, b1.id],
        dia: 6,
        desde: '14:00',
        hasta: '15:00',
        descripcion: expect.stringContaining('sábado de 14:00 a 15:00'),
      },
    ]);
    expect(
      (await http().get(`/grupos/choques?grupos=${a1.id}`).set('Authorization', a.token).expect(200)).body,
    ).toEqual([]);
    await http().get('/grupos/choques?grupos=uno').set('Authorization', a.token).expect(400);
    await http().get('/grupos/choques?grupos=1e20').set('Authorization', a.token).expect(400);
    await inscribir(a.token, [1e20]).expect(400);
    expect(await prisma.inscripcion.count({ where: { matricula: a.matricula } })).toBe(0);
  });
});

describe('AMFE modo 6: dos cargas distintas del mismo alumno a la vez', () => {
  it('se escriben una tras otra: la ocupacion siempre coincide con la carga confirmada', async () => {
    const valido = await grupo([[2, '17:00', '18:00']]);
    const choca1 = await grupo([[3, '17:00', '19:00']]);
    const choca2 = await grupo([[3, '18:00', '20:00']]);
    for (let intento = 0; intento < 5; intento += 1) {
      const a = await alumno();
      await inscribir(a.token, [choca1.id, choca2.id]).expect(409);
      const respuestas = await Promise.all([
        inscribir(a.token, [valido.id]),
        inscribir(a.token, [choca1.id, choca2.id]),
      ]);
      expect(respuestas.map((r) => r.status)).toContain(201);
      const fila = await guardada(a.folio);
      expect([fila?.estado, fila?.grupos.map((g) => Number(g.grupoId))]).toEqual(['confirmada', [valido.id]]);
    }
    const confirmados = await prisma.inscripcionGrupo.count({
      where: { grupoId: valido.id, inscripcion: { estado: 'confirmada' } },
    });
    expect(await ocupacion(valido.id)).toBe(confirmados);
    expect([await ocupacion(choca1.id), await ocupacion(choca2.id)]).toEqual([0, 0]);
  });
});
