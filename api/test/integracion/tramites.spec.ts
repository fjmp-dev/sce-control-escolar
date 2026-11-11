// RF-007 y RF-010 (Batch 9): Fig. 6 de punta a punta, rechazo solo desde En proceso y con motivo visible, no adeudo y
// historial solo cuando proceden, Entregada en la primera descarga del solicitante, y verificacion del hash.
// R-21 y CS-SEG-06: cada paso deja autor, acción, valor anterior y fecha. R-23 y CS-SEG-03: el documento es del dueño.
import { readFileSync } from 'node:fs';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/persistencia/prisma.service';
import { crearAlumno, crearApp, entrar } from './app';

let app: INestApplication;
let prisma: PrismaService;
let escolar: string;
let n = 0;
const http = () => request(app.getHttpServer());
const alumno = async (adeudo = 0) => {
  const a = await crearAlumno(prisma, `${3700000 + ++n}`, adeudo);
  return { ...a, token: await entrar(app, a.correo) };
};
const solicitar = async (token: string, tipo: string) =>
  (await http().post('/tramites').set('Authorization', token).send({ tipo }).expect(201)).body.folio as string;
const paso = (folio: string, accion: 'proceso' | 'emision' | 'rechazo', cuerpo = {}) =>
  http().post(`/tramites/${folio}/${accion}`).set('Authorization', escolar).send(cuerpo);
const estado = async (folio: string) => (await prisma.tramite.findUniqueOrThrow({ where: { folio } })).estado;
const usuario = async (correo: string) => (await prisma.usuario.findUniqueOrThrow({ where: { correo } })).id;
const asientos = (folio: string) =>
  prisma.bitacora.findMany({ where: { entidad: `tramite:${folio}` }, orderBy: { id: 'asc' } });

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  escolar = await entrar(app, 'control.escolar@sce.test');
});

afterAll(() => app.close());

describe('CF-TRA-01: historial de punta a punta (Fig. 6)', () => {
  it('R-16 y R-21: recibida, en proceso, lista con folio y hash, y entregada en la primera descarga; cada paso con fecha y asiento', async () => {
    const token = await entrar(app, 'alumno@sce.test'); // 2420001: tiene 2026A cerrado en el seed
    const folio = await solicitar(token, 'historial');
    const propios = await http().get('/alumnos/actual/tramites').set('Authorization', token).expect(200);
    expect(propios.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          folio,
          estado: 'recibida',
          documentoFolio: null,
          fechaSolicitud: expect.any(String),
          fechaActualizacion: expect.any(String),
        }),
      ]),
    );
    const cola = await http().get('/tramites?estado=recibida').set('Authorization', escolar).expect(200);
    expect(cola.body.map((t: { folio: string }) => t.folio)).toContain(folio);

    expect((await paso(folio, 'proceso').expect(200)).body.estado).toBe('en_proceso');
    const lista = await paso(folio, 'emision').expect(200);
    expect(lista.body).toMatchObject({ estado: 'lista', documentoFolio: `DOC-${folio.slice(4)}` });

    const documento = await http().get(`/tramites/${folio}/documento`).set('Authorization', token).expect(200);
    expect(documento.body.contenido).toContain('2420001');
    expect(documento.body.contenido).toContain(`Folio: ${lista.body.documentoFolio}`);
    expect(documento.body.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await estado(folio)).toBe('entregada');
    await http().get(`/tramites/${folio}/documento`).set('Authorization', token).expect(200);

    const [alumnoId, escolarId] = [await usuario('alumno@sce.test'), await usuario('control.escolar@sce.test')];
    const asiento = (accion: string, autor: string, valorAnterior: unknown) =>
      expect.objectContaining({ accion, autor, valorAnterior, fecha: expect.any(Date) });
    expect(await asientos(folio)).toEqual([
      asiento('solicitar_tramite', alumnoId, null),
      asiento('tomar_tramite', escolarId, { estado: 'recibida' }),
      asiento('emitir_documento', escolarId, { estado: 'en_proceso' }),
      asiento('entregar_documento', alumnoId, { estado: 'lista' }),
    ]);
  });
});

describe('Verificacion del documento por control escolar', () => {
  it('el hash coincide con lo emitido y detecta un contenido alterado', async () => {
    const { token } = await alumno();
    const folio = await solicitar(token, 'constancia');
    await paso(folio, 'proceso').expect(200);
    const { documentoFolio } = (await paso(folio, 'emision').expect(200)).body;
    const valido = await http().get(`/documentos/${documentoFolio}`).set('Authorization', escolar).expect(200);
    expect(valido.body).toMatchObject({ folio: documentoFolio, tramiteFolio: folio, valido: true });
    expect(valido.body.contenido).toContain('CONSTANCIA DE ESTUDIOS');

    await prisma.documento.update({ where: { folio: documentoFolio }, data: { contenido: 'Constancia alterada' } });
    const alterado = await http().get(`/documentos/${documentoFolio}`).set('Authorization', escolar).expect(200);
    expect(alterado.body.valido).toBe(false);
    await http().get('/documentos/DOC-NO-EXISTE').set('Authorization', escolar).expect(404);
  });
});

describe('CF-TRA-02: rechazo y reglas de emision', () => {
  it('R-16 y R-21: el rechazo solo sale de en proceso, el alumno ve el motivo y queda el asiento con su autor', async () => {
    const { token } = await alumno();
    const folio = await solicitar(token, 'constancia');
    const antes = await paso(folio, 'rechazo', { motivo: 'Datos incompletos' }).expect(409);
    expect(antes.body.codigo).toBe('TRAMITE_TRANSICION_INVALIDA');
    await paso(folio, 'proceso').expect(200);
    await paso(folio, 'rechazo', {}).expect(400); // el motivo es obligatorio
    await paso(folio, 'rechazo', { motivo: 'Datos incompletos' }).expect(200);
    const propios = await http().get('/alumnos/actual/tramites').set('Authorization', token).expect(200);
    expect(propios.body).toEqual([
      expect.objectContaining({ folio, estado: 'rechazada', motivoRechazo: 'Datos incompletos' }),
    ]);
    await http().get(`/tramites/${folio}/documento`).set('Authorization', token).expect(409);
    await paso(folio, 'emision').expect(409);
    expect((await asientos(folio)).at(-1)).toMatchObject({
      accion: 'rechazar_tramite',
      autor: await usuario('control.escolar@sce.test'),
      valorAnterior: { estado: 'en_proceso' },
      fecha: expect.any(Date),
    });
  });

  it('R-17: no hay constancia sin historial; el expediente sin su historial no recibe documento y el trámite sigue en proceso', async () => {
    const { matricula, token } = await alumno();
    await prisma.historial.delete({ where: { matricula } });
    try {
      const constancia = await solicitar(token, 'constancia');
      await paso(constancia, 'proceso').expect(200);
      expect((await paso(constancia, 'emision').expect(409)).body.codigo).toBe('SIN_HISTORIAL');
      expect(await estado(constancia)).toBe('en_proceso');
      expect(await prisma.documento.count({ where: { tramiteFolio: constancia } })).toBe(0);
    } finally {
      await prisma.historial.create({ data: { matricula } }); // la base compartida vuelve a ser completa
    }
  });

  it('el historial sin periodos cerrados no se emite, ni el no adeudo con adeudo; el tramite sigue en proceso', async () => {
    const conAdeudo = await alumno(1850);
    const noAdeudo = await solicitar(conAdeudo.token, 'no_adeudo');
    await paso(noAdeudo, 'proceso').expect(200);
    expect((await paso(noAdeudo, 'emision').expect(409)).body.codigo).toBe('CON_ADEUDO');
    expect(await estado(noAdeudo)).toBe('en_proceso');
    expect(await prisma.documento.count({ where: { tramiteFolio: noAdeudo } })).toBe(0);

    const nuevo = await alumno();
    const historial = await solicitar(nuevo.token, 'historial');
    await paso(historial, 'proceso').expect(200);
    expect((await paso(historial, 'emision').expect(409)).body.codigo).toBe('SIN_HISTORIAL');
    expect(await estado(historial)).toBe('en_proceso');
  });

  it('R-23 y CS-SEG-03: el documento de otro alumno no existe para quien pregunta', async () => {
    const duenio = await alumno();
    const otro = await alumno();
    const folio = await solicitar(duenio.token, 'constancia');
    await paso(folio, 'proceso').expect(200);
    await paso(folio, 'emision').expect(200);
    await http().get(`/tramites/${folio}/documento`).set('Authorization', otro.token).expect(404);
    expect(await estado(folio)).toBe('lista');
    await paso('TRA-NO-EXISTE', 'proceso').expect(404);
  });
});

describe('R-21 y CS-SEG-06 en constancia: consulta SQL de verificación', () => {
  it('cero filas tras los trámites que la API llevó por la Fig. 6', async () => {
    const consulta = readFileSync('prisma/verificacion/cs-seg-06-constancia.sql', 'utf8');
    expect(await prisma.$queryRawUnsafe(consulta)).toEqual([]);
  });
});
