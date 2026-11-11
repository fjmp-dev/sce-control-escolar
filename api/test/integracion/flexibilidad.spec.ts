// CO-FLE-01 (RNF-FLE-001, Batch 13): una segunda facultad entra con datos, sin migración estructural. Se da de alta
// por la API, con los roles de cada paso, una facultad nueva con su plan, una materia y un grupo en el periodo
// abierto de la semilla; luego un alumno de esa facultad se inscribe y dirección la ve en su reporte. La huella del
// esquema y de las migraciones es la misma antes y después, y la base sigue igual a schema.prisma.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { prisma as cli } from './postgres';
import { CONTRASENA, crearApp, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
const http = () => request(app.getHttpServer());
const CONTRASENA_ALUMNO = 'Flexibilidad-2027-sintetica';
const PERIODO = '2027A'; // abierto y con oferta publicada en la semilla
const consulta = readFileSync('prisma/verificacion/co-fle-01.sql', 'utf8');

/** Columnas, tipos, restricciones e índices del esquema público, y las migraciones aplicadas. */
async function huella() {
  const [esquema] = await prisma.$queryRaw<{ h: string }[]>`
    SELECT string_agg(f, '|' ORDER BY f) AS h FROM (
      SELECT format('c:%s.%s:%s:%s', table_name, column_name, data_type, is_nullable) AS f
        FROM information_schema.columns WHERE table_schema = 'public'
      UNION ALL SELECT format('r:%s:%s', conrelid::regclass, conname) FROM pg_constraint
       WHERE connamespace = 'public'::regnamespace
      UNION ALL SELECT format('i:%s', indexname) FROM pg_indexes WHERE schemaname = 'public'
    ) t`;
  const migraciones = await prisma.$queryRaw<{ m: string }[]>`
    SELECT migration_name AS m FROM _prisma_migrations ORDER BY migration_name`;
  return {
    esquema: createHash('sha256').update(esquema.h).digest('hex'),
    migraciones: migraciones.map((r) => r.m),
  };
}

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
});

afterAll(() => app.close());

describe('CO-FLE-01: segunda facultad sin migración estructural', () => {
  it('alta completa por la API, inscripción y reporte; la huella del esquema no cambia', async () => {
    const antes = await huella();
    const administrador = await entrar(app, 'administrador@sce.test');
    const coordinacion = await entrar(app, 'coordinacion@sce.test');
    const control = await entrar(app, 'control.escolar@sce.test');
    const direccion = await entrar(app, 'direccion@sce.test');

    // Administrador: facultad y plan (Tablas 11 y 12). Coordinación: materia y grupo (Tabla 5, Fig. 7).
    await http()
      .post('/facultades')
      .set('Authorization', administrador)
      .send({ clave: 'F3-IT', nombre: 'Facultad de Flexibilidad' })
      .expect(201);
    await http()
      .post('/planes')
      .set('Authorization', administrador)
      .send({ clave: 'F3-2027', facultadClave: 'F3-IT', creditosTotales: 300, vigenteDesde: '2027-01-01' })
      .expect(201);
    await http()
      .post('/materias')
      .set('Authorization', coordinacion)
      .send({ clave: 'FLX-101', planClave: 'F3-2027', nombre: 'Introducción a la flexibilidad', creditos: 6 })
      .expect(201);
    const grupo = (
      await http()
        .post('/grupos')
        .set('Authorization', coordinacion)
        .send({
          periodoClave: PERIODO,
          clave: 'FLX-101-A',
          materiaClave: 'FLX-101',
          profesor: 'profesor2@sce.test',
          cupo: 20,
          horarios: [{ dia: 6, horaInicio: '08:00', horaFin: '10:00', aula: 'F3-1' }],
        })
        .expect(201)
    ).body as { id: number };

    // Administrador: la cuenta de acceso; control escolar: el alumno de la nueva facultad, ligado a ella (Fig. 3).
    const matricula = '3900001';
    const correo = `a${matricula}@sce.test`;
    await http()
      .post('/usuarios')
      .set('Authorization', administrador)
      .send({ confirmacion: CONTRASENA, correo, contrasena: CONTRASENA_ALUMNO, roles: ['alumno'] })
      .expect(201);
    await http()
      .post('/alumnos')
      .set('Authorization', control)
      .send({ matricula, nombre: 'Alumno Sintético de F3', facultadClave: 'F3-IT', fechaIngreso: '2027-01-08', correo })
      .expect(201);

    // El alumno se inscribe al grupo de F3 (Fig. 4) y dirección ve a F3 en el reporte del periodo (RF-009).
    const alumno = await entrar(app, correo, CONTRASENA_ALUMNO);
    const inscripcion = await http()
      .post('/inscripciones')
      .set('Authorization', alumno)
      .send({ periodoClave: PERIODO, grupos: [grupo.id] })
      .expect(201);
    expect(inscripcion.body.estado).toBe('confirmada');
    const reporte = await http().get(`/periodos/${PERIODO}/reporte`).set('Authorization', direccion).expect(200);
    expect(reporte.body.filas.find((f: { facultadClave: string }) => f.facultadClave === 'F3-IT')).toMatchObject({
      facultadClave: 'F3-IT',
      inscritos: 1,
    });

    // Mismo esquema, mismas migraciones y sin diferencia con schema.prisma (--exit-code falla si la hay).
    expect(await huella()).toEqual(antes);
    const url = process.env.DATABASE_URL as string;
    cli(url, 'migrate', 'diff', '--from-url', url, '--to-schema-datamodel', 'prisma/schema.prisma', '--exit-code');

    // La consulta de staging encuentra la facultad completa: plan, materia, grupo, alumno e inscripción.
    const filas = await prisma.$queryRawUnsafe<{ facultad: string; completa: boolean }[]>(consulta);
    expect(filas).toContainEqual({ facultad: 'F3-IT', completa: true });
  });
});
