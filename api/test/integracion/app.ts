// Utilidades de las pruebas de integracion. La base es efimera (global-setup.ts): nada requiere limpieza.
import { readFileSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/persistencia/prisma.service';

export const CONTRASENA = 'sce-dev-2026';

export async function crearApp(): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const app = (await Test.createTestingModule({ imports: [AppModule] }).compile()).createNestApplication();
  await app.init();
  return { app, prisma: app.get(PrismaService) };
}

export const iniciar = async (app: INestApplication, correo: string, contrasena = CONTRASENA) =>
  (await request(app.getHttpServer()).post('/sesiones').send({ correo, contrasena }).expect(201)).body as {
    token: string;
    expiraEn: string;
  };

export const entrar = async (app: INestApplication, correo: string, contrasena = CONTRASENA) =>
  `Bearer ${(await iniciar(app, correo, contrasena)).token}`;

/** Cuenta propia de una prueba, para no acumular fallos ni revocar sesiones en las cuentas compartidas del seed. */
export async function crearCuenta(prisma: PrismaService, correo: string, rolId = 1) {
  const hashContrasena = await bcrypt.hash(CONTRASENA, 4);
  return prisma.usuario.create({ data: { correo, hashContrasena, roles: { create: { rolId } } } });
}

/** La matriz publicada, docs/calidad/matriz-rol-endpoint.md: la prueba lee el documento, no una copia. */
export const filasDeLaMatriz = () =>
  readFileSync('../docs/calidad/matriz-rol-endpoint.md', 'utf8')
    .split('\n')
    .filter((linea) => /^\| (GET|POST|PUT|PATCH|DELETE) \|/.test(linea))
    .map((linea) => {
      const [metodo, ruta, ...permisos] = linea
        .split('|')
        .slice(1, -1)
        .map((celda) => celda.trim());
      return { metodo, ruta: ruta.replaceAll('`', ''), permisos };
    });
