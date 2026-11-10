// RF-006 con pasarela simulada (Batch 9): cargos del periodo una sola vez, becas sin saldo a favor, pago que se aplica
// una sola vez aunque la pasarela repita o empalme el aviso (R-14), recibo solo del dueño o de caja, y corte del día.
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
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

  it('aprobado: un abono, saldo en cero, recibo y bitacora; el segundo aviso no hace nada', async () => {
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
    const recibo = await http().get(`/pagos/${id}`).set('Authorization', token).expect(200);
    expect(recibo.body).toMatchObject({
      id,
      matricula,
      estado: 'aplicado',
      referencia: expect.stringMatching(/^REF-/),
    });
  });

  it('avisos empalmados de la pasarela aplican el pago una sola vez', async () => {
    const { matricula, token } = await alumnoConAdeudo(900);
    const { id } = (await pagar(token, 900).expect(201)).body;
    const respuestas = await Promise.all(Array.from({ length: 6 }, () => simular(token, id, 'aprobado')));
    expect(respuestas.map((r) => r.status)).toEqual(Array(6).fill(200));
    expect(await prisma.movimiento.count({ where: { pagoId: BigInt(id) } })).toBe(1);
    expect(await saldo(matricula)).toBe(0);
  });

  it('rechazado: el saldo no cambia, no hay recibo y ya no se aplica', async () => {
    const { matricula, token } = await alumnoConAdeudo(700);
    const { id } = (await pagar(token, 300).expect(201)).body;
    expect((await simular(token, id, 'rechazado').expect(200)).body.estado).toBe('rechazado');
    expect((await http().get(`/pagos/${id}`).set('Authorization', token).expect(409)).body.codigo).toBe(
      'PAGO_NO_APLICADO',
    );
    expect((await simular(token, id, 'aprobado').expect(409)).body.codigo).toBe('PAGO_NO_APLICABLE');
    expect(await saldo(matricula)).toBe(700);
  });

  it('CS-SEG-02: un pago ajeno no existe para otro alumno; caja si ve el recibo', async () => {
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
});
