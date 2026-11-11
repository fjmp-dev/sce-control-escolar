// Datos sinteticos para desarrollo, pruebas y staging (manual sec. 3.5 y 20.2, riesgo RK-09).
// Idempotente: se puede correr varias veces sin duplicar. Staging pasa su propia contrasena (20.2); la de desarrollo
// esta en el README.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const CONTRASENA_DEV = process.env.CONTRASENA_SEMILLA || 'sce-dev-2026';

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
  // Batch 7 (D-13): un segundo profesor, para que ninguno imparta dos grupos a la misma hora.
  await prisma.usuario.upsert({
    where: { correo: 'profesor2@sce.test' },
    update: {},
    create: { correo: 'profesor2@sce.test', hashContrasena: hash, roles: { create: { rolId: 2 } } },
  });

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

  // Clave ISW-<semestre><nn>. Issue #73: más materias del plan, de primero a séptimo semestre (120 de 400 créditos).
  const materias = [
    ['ISW-101', 'Programación I', 8],
    ['ISW-102', 'Cálculo diferencial', 8],
    ['ISW-103', 'Matemáticas discretas', 6],
    ['ISW-201', 'Programación II', 8],
    ['ISW-202', 'Álgebra lineal', 6],
    ['ISW-203', 'Estructuras de datos', 8],
    ['ISW-301', 'Bases de datos', 8],
    ['ISW-302', 'Probabilidad y estadística', 6],
    ['ISW-303', 'Ingeniería de requisitos', 6],
    ['ISW-401', 'Sistemas operativos', 8],
    ['ISW-402', 'Desarrollo web', 6],
    ['ISW-501', 'Redes de computadoras', 8],
    ['ISW-502', 'Arquitectura de software', 6],
    ['ISW-601', 'Pruebas de software', 6],
    ['ISW-602', 'Seguridad informática', 6],
    ['ISW-701', 'Auditoría de sistemas', 6],
    ['ISW-703', 'Gestión de proyectos de software', 6],
  ] as const;
  for (const [clave, nombre, creditos] of materias) {
    await prisma.materia.upsert({
      where: { clave },
      update: {},
      create: { clave, nombre, creditos, planClave: 'ISW-2024' },
    });
  }
  // Cadenas cortas. Sin prerrequisito: ISW-102, ISW-103, ISW-202 e ISW-303; ISW-203 e ISW-402 piden Programación I,
  // que 2420001 ya acreditó.
  for (const [materiaClave, requiereClave] of [
    ['ISW-201', 'ISW-101'],
    ['ISW-301', 'ISW-201'],
    ['ISW-203', 'ISW-101'],
    ['ISW-402', 'ISW-101'],
    ['ISW-302', 'ISW-102'],
    ['ISW-401', 'ISW-203'],
    ['ISW-501', 'ISW-103'],
    ['ISW-602', 'ISW-501'],
    ['ISW-502', 'ISW-303'],
    ['ISW-601', 'ISW-303'],
    ['ISW-703', 'ISW-502'],
  ]) {
    await prisma.prerequisito.upsert({
      where: { materiaClave_requiereClave: { materiaClave, requiereClave } },
      update: {},
      create: { materiaClave, requiereClave },
    });
  }

  // CC-012: la oferta de 2027A ya esta publicada, para que el alumno pueda inscribirse.
  const ofertaPublicadaEn = new Date('2026-12-01T15:00:00Z');
  await prisma.periodo.upsert({
    where: { clave: '2027A' },
    update: { ofertaPublicadaEn },
    create: {
      clave: '2027A',
      fechaInicio: new Date('2027-01-12'),
      fechaFin: new Date('2027-06-30'),
      estado: 'abierto',
      ofertaPublicadaEn,
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

  // Calendario sintetico al 10 de noviembre de 2026: 2026A cerrado con calificaciones, 2026B en curso con el primer
  // parcial capturado (Batch 8), 2027A abierto con su oferta (Batch 5) y un adeudo. Todo sintetico (RK-09).
  await prisma.materia.upsert({
    where: { clave: 'ISW-702' },
    update: {},
    create: { clave: 'ISW-702', nombre: 'Ética profesional', creditos: 4, planClave: 'ISW-2024' },
  });
  for (const [clave, fechaInicio, fechaFin, estado, publicada] of [
    ['2026A', '2026-01-26', '2026-06-26', 'cerrado', '2025-12-01T15:00:00Z'],
    ['2026B', '2026-08-03', '2026-12-18', 'en_curso', '2026-07-01T15:00:00Z'],
  ]) {
    await prisma.periodo.upsert({
      where: { clave },
      update: {},
      create: {
        clave,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        estado,
        ofertaPublicadaEn: new Date(publicada),
      },
    });
  }
  const profesor = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor@sce.test' } });
  const profesor2 = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'profesor2@sce.test' } });
  const hora = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`);
  // [periodo, grupo, materia, cupo, ocupacion, horarios: dia (1 = lunes), inicio, fin, aula]
  const OFERTA: [string, string, string, number, number, [number, string, string, string][]][] = [
    [
      '2026A',
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
    ['2027A', 'ISW-701-A', 'ISW-701', 30, 0, [[1, '08:00', '10:00', 'A3']]], // choca con ISW-201-A y ISW-702-B; otro profesor
    ['2027A', 'ISW-701-B', 'ISW-701', 30, 0, [[5, '07:00', '10:00', 'A3']]],
    ['2027A', 'ISW-702-A', 'ISW-702', 1, 1, [[2, '09:00', '11:00', 'A2']]], // su unico lugar ya esta tomado
    ['2027A', 'ISW-702-B', 'ISW-702', 30, 0, [[1, '09:00', '11:00', 'A4']]],
    [
      '2026B',
      'ISW-301-B',
      'ISW-301',
      30,
      3,
      [
        [1, '11:00', '13:00', 'B1'],
        [3, '11:00', '13:00', 'B1'],
      ],
    ],
    [
      '2026B',
      'ISW-701-C',
      'ISW-701',
      30,
      1,
      [
        [2, '11:00', '13:00', 'B2'],
        [4, '11:00', '13:00', 'B2'],
      ],
    ],
  ];
  // Issue #73: un grupo de 2027A por materia nueva, salvo ISW-501, ISW-602 e ISW-703, sin traslape de aula ni de
  // profesor (D-13). Los de primero y segundo semestre no chocan entre sí ni con ISW-201-A.
  // [materia, días, inicio, fin, aula]
  const NUEVOS: [string, number[], string, string, string][] = [
    ['ISW-102', [1, 3], '11:00', '13:00', 'A1'],
    ['ISW-103', [2, 4], '11:00', '13:00', 'A1'],
    ['ISW-202', [1, 3], '13:00', '15:00', 'A1'],
    ['ISW-203', [2, 4], '13:00', '15:00', 'A2'],
    ['ISW-302', [1, 3], '11:00', '13:00', 'A2'],
    ['ISW-303', [2, 4], '11:00', '13:00', 'A3'],
    ['ISW-401', [1, 3], '15:00', '17:00', 'A3'],
    ['ISW-402', [2, 4], '15:00', '17:00', 'A4'],
    ['ISW-502', [1, 3], '13:00', '15:00', 'A3'],
    ['ISW-601', [5], '11:00', '14:00', 'A4'],
  ];
  for (const [materia, dias, inicio, fin, aula] of NUEVOS) {
    OFERTA.push(['2027A', `${materia}-A`, materia, 30, 0, dias.map((dia) => [dia, inicio, fin, aula])]);
  }
  const DEL_PROFESOR_2 = new Set([
    'ISW-701-A',
    'ISW-701-C',
    'ISW-102-A',
    'ISW-103-A',
    'ISW-202-A',
    'ISW-401-A',
    'ISW-402-A',
  ]);
  const grupos: Record<string, bigint> = {};
  for (const [periodoClave, clave, materiaClave, cupo, ocupacion, horarios] of OFERTA) {
    const profesorId = DEL_PROFESOR_2.has(clave) ? profesor2.id : profesor.id;
    const grupo = await prisma.grupo.upsert({
      where: { clave_periodoClave: { clave, periodoClave } },
      update: { profesorId },
      create: {
        clave,
        periodoClave,
        materiaClave,
        cupo,
        ocupacion,
        profesorId,
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
  const CARGAS: [string, string, string, string[]][] = [
    ['INS-2026A-2420001', '2420001', '2026A', ['ISW-101-A']], // acredito Programacion I: puede inscribir Programacion II
    ['INS-2026B-2420001', '2420001', '2026B', ['ISW-301-B']],
    ['INS-2026B-2420002', '2420002', '2026B', ['ISW-301-B', 'ISW-701-C']],
    ['INS-2026B-2420003', '2420003', '2026B', ['ISW-301-B']],
    ['INS-2027A-2420003', '2420003', '2027A', ['ISW-702-A']],
  ];
  for (const [folio, matricula, periodoClave, cargados] of CARGAS) {
    await prisma.inscripcion.upsert({
      where: { folio },
      update: {},
      create: {
        folio,
        matricula,
        periodoClave,
        estado: periodoClave === '2026A' ? 'cerrada' : 'confirmada',
        grupos: { create: cargados.map((grupo) => ({ grupoId: grupos[grupo] })) },
      },
    });
  }
  // D-5: final de 8.17 en Programacion I de 2026A; en 2026B, el primer parcial de Bases de datos. Cada calificacion lleva
  // su asiento de captura, como si la hubiera capturado su profesor (CS-SEG-06).
  const CALIFICACIONES: [string, string, string, number, number][] = [
    ['INS-2026A-2420001', 'ISW-101-A', '2026A', 1, 8.5],
    ['INS-2026A-2420001', 'ISW-101-A', '2026A', 2, 7],
    ['INS-2026A-2420001', 'ISW-101-A', '2026A', 3, 9],
    ['INS-2026B-2420001', 'ISW-301-B', '2026B', 1, 9],
    ['INS-2026B-2420002', 'ISW-301-B', '2026B', 1, 7.5],
    ['INS-2026B-2420003', 'ISW-301-B', '2026B', 1, 6],
  ];
  for (const [folio, grupo, periodoClave, parcial, valor] of CALIFICACIONES) {
    const datos = { folio, grupoId: grupos[grupo], parcial };
    const { id } = await prisma.calificacion.upsert({
      where: { folio_grupoId_parcial: datos },
      update: {},
      create: { ...datos, valor, profesorId: profesor.id, periodoClave },
    });
    const entidad = `calificacion:${id}`;
    if ((await prisma.bitacora.count({ where: { entidad } })) === 0) {
      await prisma.bitacora.create({ data: { autor: profesor.id, accion: 'captura_calificacion', entidad } });
    }
  }
  // RF-005: el historial de 2420001 es el que deja el cierre de 2026A: 8.17 de promedio, 8 creditos y 2 % del plan.
  await prisma.historial.update({
    where: { matricula: '2420001' },
    data: { promedio: 8.17, creditosAcumulados: 8, avance: 2 },
  });

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
