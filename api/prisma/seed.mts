// Datos sinteticos para desarrollo (manual sec. 3.5 y 20.2, riesgo RK-09).
// Idempotente: se puede correr varias veces sin duplicar.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const CONTRASENA_DEV = 'sce-dev-2026';

const ROLES = [
  [1, 'alumno', 'Alumno'],
  [2, 'profesor', 'Profesor'],
  [3, 'control_escolar', 'Control escolar'],
  [4, 'coordinacion', 'Coordinación académica'],
  [5, 'caja', 'Caja'],
  [6, 'direccion', 'Dirección'],
  [7, 'administrador', 'Administrador del sistema'],
] as const;

async function main() {
  const hash = await bcrypt.hash(CONTRASENA_DEV, 10);
  for (const [rolId, clave] of ROLES) {
    const correo = `${clave.replace('_', '.')}@sce.test`;
    await prisma.usuario.upsert({
      where: { correo },
      update: {},
      create: { correo, hashContrasena: hash, roles: { create: { rolId } } },
    });
  }

  await prisma.facultad.upsert({
    where: { clave: 'CUTG' },
    update: {},
    create: { clave: 'CUTG', nombre: 'Centro Universitario UAEM Tianguistenco' },
  });
  await prisma.planEstudios.upsert({
    where: { clave: 'ISW-2024' },
    update: {},
    create: { clave: 'ISW-2024', facultadClave: 'CUTG', creditosTotales: 400, vigenteDesde: new Date('2024-08-01') },
  });

  const materias = [
    ['ISW-101', 'Programación I', 8],
    ['ISW-201', 'Programación II', 8],
    ['ISW-301', 'Bases de datos', 8],
    ['ISW-701', 'Auditoría de sistemas', 6],
  ] as const;
  for (const [clave, nombre, creditos] of materias) {
    await prisma.materia.upsert({
      where: { clave },
      update: {},
      create: { clave, nombre, creditos, planClave: 'ISW-2024' },
    });
  }
  for (const [materiaClave, requiereClave] of [
    ['ISW-201', 'ISW-101'],
    ['ISW-301', 'ISW-201'],
  ]) {
    await prisma.prerequisito.upsert({
      where: { materiaClave_requiereClave: { materiaClave, requiereClave } },
      update: {},
      create: { materiaClave, requiereClave },
    });
  }

  await prisma.periodo.upsert({
    where: { clave: '2027A' },
    update: {},
    create: {
      clave: '2027A',
      fechaInicio: new Date('2027-01-12'),
      fechaFin: new Date('2027-06-30'),
      estado: 'abierto',
    },
  });

  // Segunda facultad, para el cambio de plantel (RF-001). Sintetica, como todo el seed (RK-09).
  await prisma.facultad.upsert({
    where: { clave: 'FSD' },
    update: {},
    create: { clave: 'FSD', nombre: 'Facultad Sintética Dos' },
  });

  // Segunda cuenta de alumno: CS-SEG-03 necesita dos alumnos, cada uno con su expediente.
  await prisma.usuario.upsert({
    where: { correo: 'alumno.dos@sce.test' },
    update: {},
    create: { correo: 'alumno.dos@sce.test', hashContrasena: hash, roles: { create: { rolId: 1 } } },
  });

  const NUMEROS = ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'];
  const CUENTAS: Record<number, string> = { 0: 'alumno@sce.test', 1: 'alumno.dos@sce.test' };
  for (const [i, numero] of NUMEROS.entries()) {
    const matricula = `24200${String(i + 1).padStart(2, '0')}`;
    const correo = CUENTAS[i];
    const usuario = correo ? await prisma.usuario.findUniqueOrThrow({ where: { correo } }) : null;
    await prisma.alumno.upsert({
      where: { matricula },
      update: {},
      create: {
        matricula,
        nombre: `Alumno Sintético ${numero}`,
        facultadClave: i % 3 === 2 ? 'FSD' : 'CUTG',
        usuarioId: usuario?.id,
        fechaIngreso: new Date(`202${2 + (i % 3)}-08-0${1 + (i % 5)}`),
        estatus: i === 8 ? 'baja' : i === 9 ? 'egresado' : 'activo',
        historial: { create: {} },
        cuenta: { create: {} },
      },
    });
  }

  // Batch 5 (RF-002): un periodo cerrado con calificaciones, la oferta de 2027A y un adeudo. Todo sintetico (RK-09).
  await prisma.materia.upsert({
    where: { clave: 'ISW-702' },
    update: {},
    create: { clave: 'ISW-702', nombre: 'Ética profesional', creditos: 4, planClave: 'ISW-2024' },
  });
  await prisma.periodo.upsert({
    where: { clave: '2026B' },
    update: {},
    create: {
      clave: '2026B',
      fechaInicio: new Date('2026-08-03'),
      fechaFin: new Date('2026-12-18'),
      estado: 'cerrado',
    },
  });
  const profesor = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor@sce.test' } });
  const hora = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`);
  // [periodo, grupo, materia, cupo, ocupacion, horarios: dia (1 = lunes), inicio, fin, aula]
  const OFERTA: [string, string, string, number, number, [number, string, string, string][]][] = [
    [
      '2026B',
      'ISW-101-A',
      'ISW-101',
      30,
      1,
      [
        [1, '07:00', '09:00', 'A1'],
        [3, '07:00', '09:00', 'A1'],
      ],
    ],
    [
      '2027A',
      'ISW-201-A',
      'ISW-201',
      30,
      0,
      [
        [1, '07:00', '09:00', 'A1'],
        [3, '07:00', '09:00', 'A1'],
      ],
    ],
    [
      '2027A',
      'ISW-301-A',
      'ISW-301',
      30,
      0,
      [
        [2, '07:00', '09:00', 'A2'],
        [4, '07:00', '09:00', 'A2'],
      ],
    ],
    ['2027A', 'ISW-701-A', 'ISW-701', 30, 0, [[1, '08:00', '10:00', 'A3']]], // choca con ISW-201-A y con ISW-702-B
    ['2027A', 'ISW-701-B', 'ISW-701', 30, 0, [[5, '07:00', '10:00', 'A3']]],
    ['2027A', 'ISW-702-A', 'ISW-702', 1, 1, [[2, '09:00', '11:00', 'A2']]], // su unico lugar ya esta tomado
    ['2027A', 'ISW-702-B', 'ISW-702', 30, 0, [[1, '09:00', '11:00', 'A4']]],
  ];
  const grupos: Record<string, bigint> = {};
  for (const [periodoClave, clave, materiaClave, cupo, ocupacion, horarios] of OFERTA) {
    const grupo = await prisma.grupo.upsert({
      where: { clave_periodoClave: { clave, periodoClave } },
      update: {},
      create: {
        clave,
        periodoClave,
        materiaClave,
        cupo,
        ocupacion,
        profesorId: profesor.id,
        horarios: {
          create: horarios.map(([dia, inicio, fin, aula]) => ({
            dia,
            horaInicio: hora(inicio),
            horaFin: hora(fin),
            aula,
          })),
        },
      },
    });
    grupos[clave] = grupo.id;
  }

  // Quien ocupa cada lugar del seed: la ocupacion siempre coincide con los inscritos (consulta de ocupacion).
  const CARGAS: [string, string, string, string][] = [
    ['INS-2026B-2420001', '2420001', '2026B', 'ISW-101-A'], // acredito Programacion I: puede inscribir Programacion II
    ['INS-2027A-2420003', '2420003', '2027A', 'ISW-702-A'],
  ];
  for (const [folio, matricula, periodoClave, grupo] of CARGAS) {
    await prisma.inscripcion.upsert({
      where: { folio },
      update: {},
      create: {
        folio,
        matricula,
        periodoClave,
        estado: periodoClave === '2026B' ? 'cerrada' : 'confirmada',
        grupos: { create: { grupoId: grupos[grupo] } },
      },
    });
  }
  // D-5: final de 8.17 en Programacion I, de un periodo cerrado.
  for (const [parcial, valor] of [
    [1, 8.5],
    [2, 7],
    [3, 9],
  ]) {
    const datos = { folio: 'INS-2026B-2420001', grupoId: grupos['ISW-101-A'], parcial };
    await prisma.calificacion.upsert({
      where: { folio_grupoId_parcial: datos },
      update: {},
      create: { ...datos, valor, profesorId: profesor.id, periodoClave: '2026B' },
    });
  }

  // D-10: adeudo vigente de 2420002, con su cargo, para que el saldo cuadre con los movimientos (CD-DAT-03).
  if ((await prisma.movimiento.count({ where: { matricula: '2420002' } })) === 0) {
    await prisma.cuentaAlumno.update({
      where: { matricula: '2420002' },
      data: {
        saldo: 1850,
        movimientos: { create: { concepto: 'Cargo sintético de prueba', importe: 1850, tipo: 'cargo' } },
      },
    });
  }

  console.log('Seed listo. Las cuentas sinteticas estan en el README.'); // CS-SEG-08: sin contrasenas en registros
}

main().finally(() => prisma.$disconnect());
