// Calidad de datos en cada ejecucion del pipeline (Tabla 39). Corren las mismas consultas que reejecuta el auditor.
import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const consulta = (caso: string) => readFileSync(`prisma/verificacion/${caso}.sql`, 'utf8');
const prisma = new PrismaClient();

afterAll(() => prisma.$disconnect());

describe('CD-DAT-01 unicidad del expediente (RF-001, RNF-DAT-001, RK-01)', () => {
  it('no hay matriculas duplicadas', async () => {
    expect(await prisma.$queryRawUnsafe(consulta('cd-dat-01'))).toEqual([]);
  });

  it('la base rechaza un segundo expediente con la misma matricula (AU-21)', async () => {
    await prisma.facultad.create({ data: { clave: 'DAT', nombre: 'Facultad de la prueba' } });
    const alumno = {
      matricula: '9100001',
      nombre: 'Alumno de la prueba',
      facultadClave: 'DAT',
      fechaIngreso: new Date('2026-08-01'),
      estatus: 'activo',
    };
    try {
      await prisma.alumno.create({ data: alumno });
      await expect(prisma.alumno.create({ data: alumno })).rejects.toThrow(/Unique constraint/);
    } finally {
      await prisma.alumno.deleteMany({ where: { matricula: alumno.matricula } });
      await prisma.facultad.delete({ where: { clave: 'DAT' } });
    }
  });
});

describe('CD-DAT-04 integridad referencial de calificaciones (RNF-DAT-001)', () => {
  it('no hay calificaciones sin grupo, periodo o profesor', async () => {
    expect(await prisma.$queryRawUnsafe(consulta('cd-dat-04'))).toEqual([]);
  });

  it('la consulta detecta un huerfano: si no, el cero de arriba no demostraria nada', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL session_replication_role = replica`); // apaga las FK en esta transaccion
        await tx.$executeRawUnsafe(
          `INSERT INTO calificacion (folio, grupo_id, profesor_id, periodo_clave, parcial, valor)
           VALUES ('NO-EXISTE', -1, '00000000-0000-4000-8000-00000000dead', 'NO-EXISTE', 1, 9)`,
        );
        expect(await tx.$queryRawUnsafe(consulta('cd-dat-04'))).toHaveLength(1);
        throw new Error('revertir');
      }),
    ).rejects.toThrow('revertir');
  });
});

describe('CD-DAT-05 completitud de la inscripcion y ocupacion de grupos (RF-002, RK-05)', () => {
  it.each(['cd-dat-05', 'ocupacion-de-grupos'])('%s: cero filas', async (caso) => {
    expect(await prisma.$queryRawUnsafe(consulta(caso))).toEqual([]);
  });

  it('las consultas detectan una inscripcion sin carga y un lugar ocupado sin inscrito', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        const { matricula } = await tx.alumno.findFirstOrThrow();
        await tx.inscripcion.create({
          data: { folio: 'SIN-CARGA', matricula, periodoClave: '2027A', estado: 'borrador' },
        });
        await tx.$executeRawUnsafe(`UPDATE grupo SET ocupacion = ocupacion + 1 WHERE clave = 'ISW-701-B'`);
        expect(await tx.$queryRawUnsafe(consulta('cd-dat-05'))).toHaveLength(1);
        expect(await tx.$queryRawUnsafe(consulta('ocupacion-de-grupos'))).toHaveLength(1);
        throw new Error('revertir');
      }),
    ).rejects.toThrow('revertir');
  });
});
