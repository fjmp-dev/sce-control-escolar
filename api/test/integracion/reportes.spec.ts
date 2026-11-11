// RF-009 (Batch 10), CF-REP-01 con Supertest: inscripcion, avance y cobranza por facultad y de la universidad.
// La prueba arma una facultad propia con valores conocidos y compara cada indicador con el calculo a mano.
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { crearAlumno, crearApp, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
let direccion: string;
const http = () => request(app.getHttpServer());

/** Inscripciones de un periodo, todas en un grupo con la ocupacion que cuadra (CD-DAT-05 y ocupacion de grupos). */
async function inscribir(periodoClave: string, cargas: [string, string][], profesorId: string) {
  const ocupacion = cargas.filter(([, estado]) => estado !== 'rechazada').length;
  const grupo = await prisma.grupo.create({
    data: { clave: `R-${periodoClave}`, materiaClave: 'ISW-101', periodoClave, profesorId, cupo: 30, ocupacion },
  });
  for (const [matricula, estado] of cargas) {
    await prisma.inscripcion.create({
      data: {
        folio: `INS-${periodoClave}-${matricula}`,
        matricula,
        periodoClave,
        estado,
        motivoRechazo: estado === 'rechazada' ? 'cupo' : null,
        grupos: { create: { grupoId: grupo.id } },
      },
    });
  }
}

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  direccion = await entrar(app, 'direccion@sce.test');
  const { id: profesorId } = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor@sce.test' } });
  await prisma.facultad.create({ data: { clave: 'RPT', nombre: 'Facultad de Reportes' } });
  const periodo = (clave: string, estado: string) =>
    prisma.periodo.create({
      data: { clave, estado, fechaInicio: new Date('2700-01-10'), fechaFin: new Date('2700-06-10') },
    });
  await periodo('2701B', 'cerrado');
  await periodo('2702A', 'abierto');

  // A1 inscrito, con historial y adeudo de 400; A2 sin inscribir, con historial y beca total; A3 inscrito sin
  // historial; A4 de baja; A5 con la carga rechazada.
  const [a1, a2, a3, a4, a5] = ['3800001', '3800002', '3800003', '3800004', '3800005'];
  await crearAlumno(prisma, a1, 1000);
  await crearAlumno(prisma, a2, 500);
  for (const m of [a3, a4, a5]) await crearAlumno(prisma, m);
  await prisma.alumno.updateMany({
    where: { matricula: { in: [a1, a2, a3, a4, a5] } },
    data: { facultadClave: 'RPT' },
  });
  await prisma.alumno.update({ where: { matricula: a4 }, data: { estatus: 'baja' } });
  // El abono de A1 entra por la pasarela simulada, como en producción: con su pago aplicado y su asiento (CD-DAT-03,
  // CD-DAT-06 y CS-SEG-06 cuentan con eso en la base que comparten las pruebas).
  const alumnoA1 = await entrar(app, `a${a1}@sce.test`);
  const { id: pago } = (await http().post('/pagos').set('Authorization', alumnoA1).send({ importe: 600 }).expect(201))
    .body;
  await http()
    .post(`/pagos/${pago}/simulacion`)
    .set('Authorization', alumnoA1)
    .send({ resultado: 'aprobado' })
    .expect(200);
  await prisma.cuentaAlumno.update({
    where: { matricula: a2 },
    data: { saldo: 0, movimientos: { create: { concepto: 'Beca', importe: 500, tipo: 'beca' } } },
  });
  await prisma.historial.update({ where: { matricula: a1 }, data: { promedio: 8.5, avance: 10 } });
  await prisma.historial.update({ where: { matricula: a2 }, data: { promedio: 7.25, avance: 5.5 } });
  await inscribir(
    '2701B',
    [
      [a1, 'cerrada'],
      [a2, 'cerrada'],
    ],
    profesorId,
  );
  await inscribir(
    '2702A',
    [
      [a1, 'confirmada'],
      [a3, 'ajustada'],
      [a5, 'rechazada'],
    ],
    profesorId,
  );
});

afterAll(() => app.close());

describe('CF-REP-01: reportes agregados de direccion (RF-009)', () => {
  it('cada indicador de una facultad coincide con el calculo a mano', async () => {
    const res = await http().get('/periodos/2702A/reporte').set('Authorization', direccion).expect(200);
    expect(res.body.periodoClave).toBe('2702A');
    expect(res.body.filas.find((f: { facultadClave: string }) => f.facultadClave === 'RPT')).toEqual({
      facultadClave: 'RPT',
      facultadNombre: 'Facultad de Reportes',
      alumnosActivos: 4, // la baja no cuenta
      inscritos: 2, // confirmada y ajustada; la rechazada no
      inscripcionPorcentaje: 50,
      promedioGeneral: 7.88, // (8.50 + 7.25) / 2 = 7.875, half-up
      avancePromedio: 3.88, // (10 + 5.5 + 0 + 0) / 4 = 3.875
      cargos: 1500,
      pagado: 600,
      becas: 500,
      saldoPendiente: 400,
      alumnosConAdeudo: 1,
      cobranzaPorcentaje: 73.33, // (600 + 500) / 1500
    });
  });

  it('la ultima fila es la universidad y suma a todas las facultades', async () => {
    const { body } = await http().get('/periodos/2702A/reporte').set('Authorization', direccion).expect(200);
    const universidad = body.filas.at(-1);
    const facultades = body.filas.slice(0, -1);
    expect(universidad).toMatchObject({ facultadClave: null, facultadNombre: 'Universidad' });
    for (const campo of ['alumnosActivos', 'inscritos', 'alumnosConAdeudo', 'cargos', 'pagado', 'becas']) {
      const suma = facultades.reduce((s: number, f: Record<string, number>) => s + f[campo] * 100, 0) / 100;
      expect(universidad[campo]).toBeCloseTo(suma, 2);
    }
    expect(facultades.map((f: { facultadClave: string }) => f.facultadClave)).toContain('CUTG');
  });

  it('un periodo que no existe responde 404; una clave mal escrita, 400', async () => {
    const codigo = async (clave: string) =>
      (await http().get(`/periodos/${clave}/reporte`).set('Authorization', direccion)).status;
    expect(await codigo('1999A')).toBe(404);
    expect(await codigo('2027X')).toBe(400);
  });

  it('el reporte no expone matriculas ni nombres de alumnos (Tabla 16, minimizacion)', async () => {
    const { text } = await http().get('/periodos/2702A/reporte').set('Authorization', direccion).expect(200);
    expect(text).not.toMatch(/3800001|Alumno Sint/);
  });
});
