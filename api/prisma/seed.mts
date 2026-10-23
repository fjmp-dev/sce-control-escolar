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
] as const;

async function main() {
  for (const [id, clave, nombre] of ROLES) {
    await prisma.rol.upsert({ where: { id }, update: { clave, nombre }, create: { id, clave, nombre } });
  }

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
    await prisma.materia.upsert({ where: { clave }, update: {}, create: { clave, nombre, creditos, planClave: 'ISW-2024' } });
  }
  for (const [materiaClave, requiereClave] of [['ISW-201', 'ISW-101'], ['ISW-301', 'ISW-201']]) {
    await prisma.prerequisito.upsert({
      where: { materiaClave_requiereClave: { materiaClave, requiereClave } },
      update: {},
      create: { materiaClave, requiereClave },
    });
  }

  await prisma.periodo.upsert({
    where: { clave: '2027A' },
    update: {},
    create: { clave: '2027A', fechaInicio: new Date('2027-01-12'), fechaFin: new Date('2027-06-30'), estado: 'abierto' },
  });

  const alumnoUsuario = await prisma.usuario.findUniqueOrThrow({ where: { correo: 'alumno@sce.test' } });
  await prisma.alumno.upsert({
    where: { matricula: '2420001' },
    update: {},
    create: {
      matricula: '2420001',
      nombre: 'Alumno Sintético Uno',
      facultadClave: 'CUTG',
      usuarioId: alumnoUsuario.id,
      fechaIngreso: new Date('2024-08-05'),
      estatus: 'activo',
      historial: { create: {} },
      cuenta: { create: {} },
    },
  });

  console.log(`Seed listo. Usuarios <rol>@sce.test, contraseña: ${CONTRASENA_DEV}`);
}

main().finally(() => prisma.$disconnect());
