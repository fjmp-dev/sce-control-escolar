// RF-007 y RF-010 (Batch 9): Fig. 6 de punta a punta, rechazo solo desde En proceso y con motivo visible, no adeudo y
// historial solo cuando proceden, Entregada en la primera descarga del solicitante, y verificacion del hash.
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

beforeAll(async () => {
  ({ app, prisma } = await crearApp());
  escolar = await entrar(app, 'control.escolar@sce.test');
});

afterAll(() => app.close());

describe('CF-TRA-01: historial de punta a punta (Fig. 6)', () => {
  it('recibida, en proceso, lista con folio y hash, y entregada en la primera descarga', async () => {
    const token = await entrar(app, 'alumno@sce.test'); // 2420001: tiene 2026A cerrado en el seed
    const folio = await solicitar(token, 'historial');
    const propios = await http().get('/alumnos/actual/tramites').set('Authorization', token).expect(200);
    expect(propios.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ folio, estado: 'recibida', documentoFolio: null })]),
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

    const asientos = await prisma.bitacora.findMany({ where: { entidad: `tramite:${folio}` }, orderBy: { id: 'asc' } });
    expect(asientos.map((a) => a.accion)).toEqual([
      'solicitar_tramite',
      'tomar_tramite',
      'emitir_documento',
      'entregar_documento',
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
  it('el rechazo solo sale de en proceso y el alumno ve el motivo', async () => {
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
  });

  it('no adeudo con adeudo e historial sin periodos cerrados no se emiten, y el tramite sigue en proceso', async () => {
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

  it('CS-SEG-02: el documento de otro alumno no existe para quien pregunta', async () => {
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
