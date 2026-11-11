// RF-006 con pasarela simulada (Batch 9): cargos del periodo una sola vez, becas sin saldo a favor, pago que se aplica
// una sola vez aunque la pasarela repita o empalme el aviso (R-14), recibo solo del dueño o de caja, y corte del día.
// CI-PAG-01 (#69): dos intentos por el mismo adeudo no dejan el saldo negativo. R-15: un fallo a mitad no confirma el
// pago. R-21 y CS-SEG-06: cada cambio de un pago, también el rechazo de la pasarela, deja su asiento. R-23 y CS-SEG-03:
// un alumno no ve ni paga el pago de otro. R-24: lo que hace caja no toca el historial académico. CD-DAT-03 y CD-DAT-06
// (CC-011): tras todo eso, el estado de cuenta concilia con los abonos y el corte, y cada pago aplicado tiene su fecha de
// confirmación.
import { readFileSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BitacoraService, USUARIO_TECNICO } from '../../src/bitacora/bitacora.service';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { crearAlumno, crearApp, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
let caja: string;
let n = 0;
const http = () => request(app.getHttpServer());
const nueva = () => `${3600000 + ++n}`;
const saldo = async (matricula: string) =>
  Number((await prisma.cuentaAlumno.findUniqueOrThrow({ where: { matricula } })).saldo);
const alumnoConAdeudo = async (adeudo: number) => {
  const alumno = await crearAlumno(prisma, nueva(), adeudo);
  return { ...alumno, token: await entrar(app, alumno.correo) };
};
const pagar = (token: string, importe: number) => http().post('/pagos').set('Authorization', token).send({ importe });
const simular = (token: string, id: number, resultado: string) =>
  http().post(`/pagos/${id}/simulacion`).set('Authorization', token).send({ resultado });
const verificacion = (caso: string) => prisma.$queryRawUnsafe(readFileSync(`prisma/verificacion/${caso}.sql`, 'utf8'));

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  caja = await entrar(app, 'caja@sce.test');
});

afterAll(() => app.close());

describe('Caja: cargos del periodo y becas', () => {
  it('genera el cargo a cada inscrito una sola vez, aunque caja lo repita', async () => {
    const clave = '2601A';
    await prisma.periodo.create({
      data: { clave, fechaInicio: new Date('2601-01-10'), fechaFin: new Date('2601-06-10'), estado: 'abierto' },
    });
    const inscritos = [await crearAlumno(prisma, nueva()), await crearAlumno(prisma, nueva())];
    const profesor = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor@sce.test' } });
    const grupo = await prisma.grupo.create({
      data: {
        clave: 'P-1',
        materiaClave: 'ISW-101',
        periodoClave: clave,
        profesorId: profesor.id,
        cupo: 30,
        ocupacion: 2,
      },
    });
    for (const { matricula } of inscritos) {
      await prisma.inscripcion.create({
        data: {
          folio: `INS-${clave}-${matricula}`,
          matricula,
          periodoClave: clave,
          estado: 'confirmada',
          grupos: { create: { grupoId: grupo.id } }, // CD-DAT-05: confirmada siempre con carga
        },
      });
    }
    const cuerpo = { concepto: `Inscripción ${clave}`, importe: 1850 };
    const primera = await http().post(`/periodos/${clave}/cargos`).set('Authorization', caja).send(cuerpo).expect(200);
    expect(primera.body).toEqual({ periodoClave: clave, concepto: cuerpo.concepto, generados: 2, yaExistian: 0 });
    const segunda = await http().post(`/periodos/${clave}/cargos`).set('Authorization', caja).send(cuerpo).expect(200);
    expect(segunda.body).toMatchObject({ generados: 0, yaExistian: 2 });
    for (const { matricula } of inscritos) {
      expect(await saldo(matricula)).toBe(1850);
      expect(await prisma.bitacora.count({ where: { entidad: `cuenta:${matricula}`, accion: 'cargo' } })).toBe(1);
    }
  });

  it('la beca no deja saldo a favor', async () => {
    const { matricula } = await alumnoConAdeudo(1000);
    const beca = (importe: number) =>
      http().post(`/alumnos/${matricula}/becas`).set('Authorization', caja).send({ concepto: 'Beca', importe });
    expect((await beca(1000.01).expect(409)).body.codigo).toBe('IMPORTE_MAYOR_AL_SALDO');
    expect((await beca(400).expect(201)).body.saldo).toBe(600);
    expect(await saldo(matricula)).toBe(600);
  });

  it('estado de cuenta: el alumno ve el suyo y caja el de cualquier matricula que exista', async () => {
    const { matricula, token } = await alumnoConAdeudo(250);
    const propia = await http().get('/alumnos/actual/cuenta').set('Authorization', token).expect(200);
    expect(propia.body).toMatchObject({
      matricula,
      saldo: 250,
      movimientos: [expect.objectContaining({ tipo: 'cargo', importe: 250 })],
      pagos: [],
    });
    const deCaja = await http().get(`/alumnos/${matricula}/cuenta`).set('Authorization', caja).expect(200);
    expect(deCaja.body).toEqual(propia.body);
    await http().get('/alumnos/9999999/cuenta').set('Authorization', caja).expect(404);
  });
});

describe('Pago simulado: se aplica una sola vez (R-14)', () => {
  it('sin adeudo no hay pago, ni por mas del saldo', async () => {
    const sinAdeudo = await alumnoConAdeudo(0);
    expect((await pagar(sinAdeudo.token, 100).expect(409)).body.codigo).toBe('SIN_ADEUDO');
    const conAdeudo = await alumnoConAdeudo(500);
    expect((await pagar(conAdeudo.token, 500.01).expect(409)).body.codigo).toBe('IMPORTE_MAYOR_AL_SALDO');
  });

  it('CI-PAG-01 R-14: aprobado, un abono, saldo en cero, recibo y bitacora; el segundo aviso no hace nada', async () => {
    const { matricula, token } = await alumnoConAdeudo(1850);
    const intento = await pagar(token, 1850).expect(201);
    expect(intento.body).toMatchObject({ estado: 'pendiente', importe: 1850, aplicadoEn: null });
    const { id } = intento.body;
    expect(await saldo(matricula)).toBe(1850); // pendiente no mueve el saldo

    const aplicado = await simular(token, id, 'aprobado').expect(200);
    expect(aplicado.body).toMatchObject({ estado: 'aplicado', aplicadoEn: expect.any(String) });
    await simular(token, id, 'aprobado').expect(200);
    expect((await simular(token, id, 'rechazado').expect(409)).body.codigo).toBe('PAGO_NO_APLICABLE');

    expect(await saldo(matricula)).toBe(0);
    expect(await prisma.movimiento.count({ where: { pagoId: BigInt(id) } })).toBe(1);
    expect(await prisma.bitacora.count({ where: { entidad: `pago:${id}`, accion: 'pago_aplicado' } })).toBe(1);
    // CC-011: la confirmación queda con la hora de la base, una sola vez; los avisos repetidos no la cambian.
    const { fechaConfirmacion } = await prisma.pago.findUniqueOrThrow({ where: { id: BigInt(id) } });
    expect(fechaConfirmacion).toEqual(expect.any(Date));
    expect(new Date(aplicado.body.aplicadoEn).getTime() - fechaConfirmacion!.getTime()).toBeLessThan(60_000);
    const recibo = await http().get(`/pagos/${id}`).set('Authorization', token).expect(200);
    expect(recibo.body).toMatchObject({
      id,
      matricula,
      estado: 'aplicado',
      referencia: expect.stringMatching(/^REF-/),
    });
  });

  it('CI-PAG-01 R-14: avisos empalmados de la pasarela aplican el pago una sola vez', async () => {
    const { matricula, token } = await alumnoConAdeudo(900);
    const { id } = (await pagar(token, 900).expect(201)).body;
    const respuestas = await Promise.all(Array.from({ length: 6 }, () => simular(token, id, 'aprobado')));
    expect(respuestas.map((r) => r.status)).toEqual(Array(6).fill(200));
    expect(await prisma.movimiento.count({ where: { pagoId: BigInt(id) } })).toBe(1);
    expect(await saldo(matricula)).toBe(0);
  });

  it('R-21: el rechazo de la pasarela deja un asiento del usuario técnico con el valor anterior; el saldo no cambia, no hay recibo y ya no se aplica', async () => {
    const { matricula, token } = await alumnoConAdeudo(700);
    const { id } = (await pagar(token, 300).expect(201)).body;
    expect((await simular(token, id, 'rechazado').expect(200)).body.estado).toBe('rechazado');
    expect((await simular(token, id, 'rechazado').expect(200)).body.estado).toBe('rechazado'); // aviso repetido
    expect(await prisma.bitacora.findMany({ where: { entidad: `pago:${id}` } })).toEqual([
      expect.objectContaining({
        autor: USUARIO_TECNICO,
        accion: 'pago_rechazado',
        valorAnterior: { estado: 'pendiente' },
        fecha: expect.any(Date),
      }),
    ]);
    expect((await http().get(`/pagos/${id}`).set('Authorization', token).expect(409)).body.codigo).toBe(
      'PAGO_NO_APLICADO',
    );
    expect((await simular(token, id, 'aprobado').expect(409)).body.codigo).toBe('PAGO_NO_APLICABLE');
    expect(await saldo(matricula)).toBe(700);
    expect((await prisma.pago.findUniqueOrThrow({ where: { id: BigInt(id) } })).fechaConfirmacion).toBeNull();
    expect(await verificacion('cs-seg-06-pago')).toEqual([]); // CS-SEG-06: todo pago cambiado por la API tiene su asiento
  });

  it('R-23 y CS-SEG-03: un pago ajeno no existe para otro alumno; caja si ve el recibo', async () => {
    const duenio = await alumnoConAdeudo(200);
    const otro = await alumnoConAdeudo(200);
    const { id } = (await pagar(duenio.token, 200).expect(201)).body;
    await simular(otro.token, id, 'aprobado').expect(404);
    expect(await saldo(duenio.matricula)).toBe(200);
    await simular(duenio.token, id, 'aprobado').expect(200);
    await http().get(`/pagos/${id}`).set('Authorization', otro.token).expect(404);
    await http().get(`/pagos/${id}`).set('Authorization', caja).expect(200);
  });
});

describe('CI-PAG-01 (#69): dos intentos por el mismo adeudo', () => {
  const abonos = (matricula: string) => prisma.movimiento.count({ where: { matricula, tipo: 'abono' } });
  const estado = async (id: number) => (await prisma.pago.findUniqueOrThrow({ where: { id: BigInt(id) } })).estado;

  it('CI-PAG-01 R-14: aprobados los dos, solo uno se aplica; el segundo responde 409 PAGO_NO_APLICABLE y queda rechazado', async () => {
    const { matricula, token } = await alumnoConAdeudo(1850);
    const primero = (await pagar(token, 1850).expect(201)).body.id;
    const segundo = (await pagar(token, 1850).expect(201)).body.id;

    expect((await simular(token, primero, 'aprobado').expect(200)).body.estado).toBe('aplicado');
    const rechazo = await simular(token, segundo, 'aprobado');
    expect(rechazo.status).toBe(409);
    expect(rechazo.body).toEqual({
      codigo: 'PAGO_NO_APLICABLE',
      mensaje: expect.stringMatching(/rebasa tu saldo.*no se cobró/),
    });

    expect(await saldo(matricula)).toBe(0);
    expect(await abonos(matricula)).toBe(1);
    expect(await estado(segundo)).toBe('rechazado');
    // R-21: el rechazo lo firma el usuario técnico (CC-015), con el estado y el saldo vigente de antes.
    const asientos = await prisma.bitacora.findMany({
      where: { entidad: `pago:${segundo}`, accion: 'pago_rechazado' },
    });
    expect(asientos).toEqual([
      expect.objectContaining({ autor: USUARIO_TECNICO, valorAnterior: { estado: 'pendiente', saldo: 0 } }),
    ]);
    // Un aviso repetido del pago rechazado tampoco lo aplica, y no tiene recibo.
    expect((await simular(token, segundo, 'aprobado').expect(409)).body.codigo).toBe('PAGO_NO_APLICABLE');
    expect((await http().get(`/pagos/${segundo}`).set('Authorization', token).expect(409)).body.codigo).toBe(
      'PAGO_NO_APLICADO',
    );
    expect(await saldo(matricula)).toBe(0);
  });

  it('CI-PAG-01 R-14: aprobados a la vez, uno se aplica y el otro se rechaza; el saldo no queda negativo', async () => {
    const { matricula, token } = await alumnoConAdeudo(900);
    const ids = [(await pagar(token, 900).expect(201)).body.id, (await pagar(token, 900).expect(201)).body.id];
    const respuestas = await Promise.all(ids.map((id) => simular(token, id, 'aprobado')));
    expect(respuestas.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(await saldo(matricula)).toBe(0);
    expect(await abonos(matricula)).toBe(1);
    expect((await Promise.all(ids.map(estado))).sort()).toEqual(['aplicado', 'rechazado']);
  });

  it('CI-PAG-01 R-14: un intento que la beca dejó por encima del saldo se rechaza; uno que cabe se aplica', async () => {
    const { matricula, token } = await alumnoConAdeudo(1000);
    const completo = (await pagar(token, 1000).expect(201)).body.id;
    const parcial = (await pagar(token, 600).expect(201)).body.id;
    await http()
      .post(`/alumnos/${matricula}/becas`)
      .set('Authorization', caja)
      .send({ concepto: 'Beca', importe: 400 })
      .expect(201);
    expect((await simular(token, completo, 'aprobado').expect(409)).body.codigo).toBe('PAGO_NO_APLICABLE');
    expect((await simular(token, parcial, 'aprobado').expect(200)).body.estado).toBe('aplicado');
    expect(await saldo(matricula)).toBe(0);
  });
});

describe('R-15: un fallo a mitad de la aplicación no confirma el pago', () => {
  it('R-15: si la bitacora falla, el pago sigue pendiente, sin recibo ni abono y con el saldo intacto; el reintento lo aplica', async () => {
    const { matricula, token } = await alumnoConAdeudo(640);
    const { id } = (await pagar(token, 640).expect(201)).body;
    const espia = jest.spyOn(app.get(BitacoraService), 'registrar').mockRejectedValueOnce(new Error('falla simulada'));
    const caida = await simular(token, id, 'aprobado');
    espia.mockRestore();
    expect(caida.status).toBe(500);
    expect(caida.body.codigo).toBe('ERROR_INTERNO');

    expect((await prisma.pago.findUniqueOrThrow({ where: { id: BigInt(id) } })).estado).toBe('pendiente');
    expect(await prisma.movimiento.count({ where: { pagoId: BigInt(id) } })).toBe(0);
    expect(await saldo(matricula)).toBe(640);
    expect((await http().get(`/pagos/${id}`).set('Authorization', token).expect(409)).body.codigo).toBe(
      'PAGO_NO_APLICADO',
    );

    expect((await simular(token, id, 'aprobado').expect(200)).body.estado).toBe('aplicado');
    expect(await saldo(matricula)).toBe(0);
  });

  it('R-15 y R-21: si la bitácora falla al rechazar, el pago sigue pendiente; el reintento lo rechaza con su asiento', async () => {
    const { token } = await alumnoConAdeudo(410);
    const { id } = (await pagar(token, 410).expect(201)).body;
    const espia = jest.spyOn(app.get(BitacoraService), 'registrar').mockRejectedValueOnce(new Error('falla simulada'));
    const caida = await simular(token, id, 'rechazado');
    espia.mockRestore();
    expect(caida.status).toBe(500);
    expect((await prisma.pago.findUniqueOrThrow({ where: { id: BigInt(id) } })).estado).toBe('pendiente');

    expect((await simular(token, id, 'rechazado').expect(200)).body.estado).toBe('rechazado');
    expect(await prisma.bitacora.count({ where: { entidad: `pago:${id}`, accion: 'pago_rechazado' } })).toBe(1);
  });
});

describe('R-24 y CS-SEG-02: caja no modifica el historial académico', () => {
  it('R-24: tras cargos del periodo, beca, pago y corte, el historial y las calificaciones del alumno no cambian', async () => {
    const clave = '2602A';
    await prisma.periodo.create({
      data: { clave, fechaInicio: new Date('2602-01-10'), fechaFin: new Date('2602-06-10'), estado: 'abierto' },
    });
    const { matricula, correo } = await crearAlumno(prisma, nueva());
    const profesor = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor@sce.test' } });
    const grupo = await prisma.grupo.create({
      data: {
        clave: 'P-2',
        materiaClave: 'ISW-101',
        periodoClave: clave,
        profesorId: profesor.id,
        cupo: 30,
        ocupacion: 1,
      },
    });
    const folio = `INS-${clave}-${matricula}`;
    await prisma.inscripcion.create({
      data: { folio, matricula, periodoClave: clave, estado: 'confirmada', grupos: { create: { grupoId: grupo.id } } },
    });
    await prisma.calificacion.create({
      data: { folio, grupoId: grupo.id, profesorId: profesor.id, periodoClave: clave, parcial: 1, valor: 9.5 },
    });
    await prisma.historial.update({ where: { matricula }, data: { promedio: 9.5, creditosAcumulados: 8, avance: 2 } });
    const coordinacion = await entrar(app, 'coordinacion@sce.test');
    const kardex = async () =>
      (await http().get(`/alumnos/${matricula}/calificaciones`).set('Authorization', coordinacion).expect(200)).body;
    const historial = () => prisma.historial.findUniqueOrThrow({ where: { matricula } });
    const antes = { kardex: await kardex(), historial: await historial() };

    const cuerpo = { concepto: `Inscripción ${clave}`, importe: 1850 };
    await http().post(`/periodos/${clave}/cargos`).set('Authorization', caja).send(cuerpo).expect(200);
    await http()
      .post(`/alumnos/${matricula}/becas`)
      .set('Authorization', caja)
      .send({ concepto: 'Beca', importe: 350 })
      .expect(201);
    const token = await entrar(app, correo);
    const { id } = (await pagar(token, 1500).expect(201)).body;
    await simular(token, id, 'aprobado').expect(200);
    await http().get(`/pagos/${id}`).set('Authorization', caja).expect(200);
    const hoy = new Date(Date.now() - 6 * 3_600_000).toISOString().slice(0, 10);
    await http().get(`/pagos?fecha=${hoy}`).set('Authorization', caja).expect(200);
    const intento = await http()
      .put(`/grupos/${grupo.id}/calificaciones`)
      .set('Authorization', caja)
      .send({ parcial: 1, calificaciones: [{ folio, valor: 5 }] });

    expect(intento.status).toBe(403);
    expect(await saldo(matricula)).toBe(0);
    expect({ kardex: await kardex(), historial: await historial() }).toEqual(antes);
  });
});

describe('Corte de caja', () => {
  it('lista los pagos aplicados del dia en la Ciudad de Mexico y su total', async () => {
    const { token } = await alumnoConAdeudo(123.45);
    const { id } = (await pagar(token, 123.45).expect(201)).body;
    await simular(token, id, 'aprobado').expect(200);
    const hoy = new Date(Date.now() - 6 * 3_600_000).toISOString().slice(0, 10);
    const corte = await http().get(`/pagos?fecha=${hoy}`).set('Authorization', caja).expect(200);
    expect(corte.body.pagos).toEqual(expect.arrayContaining([expect.objectContaining({ id, importe: 123.45 })]));
    const suma = corte.body.pagos.reduce((s: number, p: { importe: number }) => s + p.importe * 100, 0) / 100;
    expect(corte.body.total).toBeCloseTo(suma, 2);
    const otroDia = await http().get('/pagos?fecha=2001-01-01').set('Authorization', caja).expect(200);
    expect(otroDia.body).toEqual({ fecha: '2001-01-01', pagos: [], total: 0 });
  });

  it('CD-DAT-03 y CD-DAT-06: tras los pagos de la API, cero diferencias y cero pagos aplicados sin confirmación', async () => {
    expect(await verificacion('cd-dat-03')).toEqual([]);
    expect(await verificacion('cd-dat-06')).toEqual([]);
  });
});
