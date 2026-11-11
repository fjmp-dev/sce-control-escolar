// Calidad de datos en cada ejecucion del pipeline (Tabla 39). Corren las mismas consultas que reejecuta el auditor.
import { readFileSync } from 'node:fs';
import { Prisma, PrismaClient } from '@prisma/client';
import { USUARIO_TECNICO } from '../../src/bitacora/bitacora.service';

const consulta = (caso: string) => readFileSync(`prisma/verificacion/${caso}.sql`, 'utf8');
const prisma = new PrismaClient();

afterAll(() => prisma.$disconnect());

describe('R-01 y CD-DAT-01: unicidad del expediente (RF-001, RNF-DAT-001, RK-01)', () => {
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

describe('R-21 y CS-SEG-06 en pago y constancia: cada cambio con su asiento (Tabla 49, AU-16)', () => {
  // Cada caso se inyecta en una transacción que se revierte. El cero filas tras cambios reales está en pagos.spec y
  // tramites.spec: aquí, sobre el seed solo, no habría pagos ni trámites que revisar.
  const revertido = (caso: (tx: Prisma.TransactionClient) => Promise<void>) =>
    expect(
      prisma.$transaction(async (tx) => {
        await caso(tx);
        throw new Error('revertir');
      }),
    ).rejects.toThrow('revertir');
  const cuenta = async (tx: Prisma.TransactionClient, correo: string) =>
    (await tx.usuario.findUniqueOrThrow({ where: { correo } })).id;
  const conCuenta = (tx: Prisma.TransactionClient) =>
    tx.alumno.findMany({ where: { usuarioId: { not: null } }, take: 2, include: { usuario: true } });

  it('R-21: detecta un pago que cambió sin asiento y un asiento de pago firmado por una persona', async () => {
    await revertido(async (tx) => {
      const { matricula, usuarioId } = await tx.alumno.findFirstOrThrow({ where: { usuarioId: { not: null } } });
      const datos = { matricula, referencia: 'REF-DATOS', importe: 10 };
      const sinAsiento = await tx.pago.create({
        data: { ...datos, claveIdempotencia: 'datos-1', estado: 'rechazado' },
      });
      const pendiente = await tx.pago.create({
        data: { ...datos, claveIdempotencia: 'datos-2', estado: 'pendiente' },
      });
      await tx.bitacora.create({
        data: {
          autor: usuarioId!,
          accion: 'pago_aplicado',
          entidad: `pago:${pendiente.id}`,
          valorAnterior: { saldo: 10 },
        },
      });
      const problemas = await tx.$queryRawUnsafe(consulta('cs-seg-06-pago'));
      expect(problemas).toContainEqual({
        pago: String(sinAsiento.id),
        asiento: null,
        problema: 'pago rechazado sin un solo asiento de su cambio',
      });
      expect(problemas).toContainEqual(
        expect.objectContaining({
          pago: String(pendiente.id),
          problema: 'asiento que no corresponde al estado del pago',
        }),
      );
      expect(problemas).toContainEqual(
        expect.objectContaining({
          pago: String(pendiente.id),
          problema: 'asiento sin el usuario técnico o sin valor anterior',
        }),
      );
    });
  });

  it('R-21: detecta un pago con dos asientos y los asientos del técnico sin su valor anterior', async () => {
    await revertido(async (tx) => {
      const { matricula } = await tx.alumno.findFirstOrThrow();
      let n = 0;
      const pago = (estado: string) =>
        tx.pago.create({
          data: { matricula, referencia: 'REF-DATOS', importe: 10, claveIdempotencia: `datos-${++n}`, estado },
        });
      const asiento = (id: bigint, accion: string, valorAnterior: Prisma.InputJsonObject) =>
        tx.bitacora.create({ data: { autor: USUARIO_TECNICO, accion, entidad: `pago:${id}`, valorAnterior } });
      const doble = await pago('rechazado');
      await asiento(doble.id, 'pago_rechazado', { estado: 'pendiente' });
      await asiento(doble.id, 'pago_rechazado', { estado: 'pendiente' });
      const rechazado = await pago('rechazado');
      const desdeAplicado = await asiento(rechazado.id, 'pago_rechazado', { estado: 'aplicado' });
      const aplicado = await pago('aplicado');
      const sinSaldo = await asiento(aplicado.id, 'pago_aplicado', { estado: 'pendiente' });

      const problemas = await tx.$queryRawUnsafe(consulta('cs-seg-06-pago'));
      expect(problemas).toEqual(
        expect.arrayContaining([
          { pago: String(doble.id), asiento: null, problema: 'pago rechazado sin un solo asiento de su cambio' },
          ...[desdeAplicado, sinSaldo].map((a) => ({
            pago: a.entidad.slice(5),
            asiento: String(a.id),
            problema: 'asiento sin el usuario técnico o sin valor anterior',
          })),
        ]),
      );
    });
  });

  it('R-21: detecta un trámite que cambió sin asiento, un paso saltado, un paso sin rol y un documento sin emisión', async () => {
    await revertido(async (tx) => {
      const { matricula, usuarioId } = await tx.alumno.findFirstOrThrow({ where: { usuarioId: { not: null } } });
      const tramite = (folio: string, estado: string) =>
        tx.tramite.create({ data: { folio, matricula, tipo: 'constancia', estado } });
      const asiento = (folio: string, accion: string, autor: string, estado?: string) =>
        tx.bitacora.create({
          data: { autor, accion, entidad: `tramite:${folio}`, valorAnterior: estado ? { estado } : undefined },
        });
      await tramite('TRA-DATOS-1', 'en_proceso');
      await tramite('TRA-DATOS-2', 'lista');
      await asiento('TRA-DATOS-2', 'solicitar_tramite', usuarioId!);
      await asiento('TRA-DATOS-2', 'emitir_documento', USUARIO_TECNICO, 'en_proceso');
      await tx.documento.create({
        data: { folio: 'DOC-DATOS-1', tramiteFolio: 'TRA-DATOS-1', tipo: 'constancia', hash: 'h' },
      });
      const problemas = await tx.$queryRawUnsafe(consulta('cs-seg-06-constancia'));
      expect(problemas).toEqual(
        expect.arrayContaining([
          {
            tramite: 'TRA-DATOS-1',
            asiento: null,
            problema: 'trámite en_proceso sin el asiento de su último cambio',
          },
          { tramite: 'TRA-DATOS-1', asiento: null, problema: 'documento sin asiento de emisión' },
          expect.objectContaining({
            tramite: 'TRA-DATOS-2',
            problema: 'cambio que no sale del estado en que lo dejó el asiento anterior',
          }),
          expect.objectContaining({
            tramite: 'TRA-DATOS-2',
            problema: 'toma, emisión o rechazo de alguien sin el rol de control escolar',
          }),
        ]),
      );
    });
  });

  it('R-21: detecta un valor anterior falso, una solicitud de otro alumno, una toma de caja y un asiento sin trámite', async () => {
    await revertido(async (tx) => {
      const [alumno, otro] = await conCuenta(tx);
      const escolar = await cuenta(tx, 'control.escolar@sce.test');
      const tramite = (folio: string, estado: string) =>
        tx.tramite.create({ data: { folio, matricula: alumno.matricula, tipo: 'constancia', estado } });
      const asiento = (folio: string, accion: string, autor: string, estado?: string) =>
        tx.bitacora.create({
          data: { autor, accion, entidad: `tramite:${folio}`, valorAnterior: estado ? { estado } : undefined },
        });
      await tramite('TRA-DATOS-3', 'en_proceso');
      await asiento('TRA-DATOS-3', 'solicitar_tramite', alumno.usuarioId!);
      const desdeLista = await asiento('TRA-DATOS-3', 'tomar_tramite', escolar, 'lista');
      await tramite('TRA-DATOS-4', 'recibida');
      const ajena = await asiento('TRA-DATOS-4', 'solicitar_tramite', otro.usuarioId!);
      await tramite('TRA-DATOS-5', 'en_proceso');
      await asiento('TRA-DATOS-5', 'solicitar_tramite', alumno.usuarioId!);
      const deCaja = await asiento('TRA-DATOS-5', 'tomar_tramite', await cuenta(tx, 'caja@sce.test'), 'recibida');
      const huerfano = await asiento('TRA-DATOS-NO-EXISTE', 'solicitar_tramite', alumno.usuarioId!);

      const fila = (a: { id: bigint; entidad: string }, problema: string) => ({
        tramite: a.entidad.slice(8),
        asiento: String(a.id),
        problema,
      });
      const problemas = await tx.$queryRawUnsafe<{ tramite: string }[]>(consulta('cs-seg-06-constancia'));
      expect(problemas.filter((p) => p.tramite.startsWith('TRA-DATOS-'))).toEqual(
        expect.arrayContaining([
          fila(desdeLista, 'cambio que no sale del estado en que lo dejó el asiento anterior'),
          fila(ajena, 'solicitud o descarga de alguien que no era la cuenta del alumno'),
          fila(deCaja, 'toma, emisión o rechazo de alguien sin el rol de control escolar'),
          fila(huerfano, 'asiento sin trámite'),
        ]),
      );
      expect(problemas.filter((p) => p.tramite.startsWith('TRA-DATOS-'))).toHaveLength(4);
    });
  });

  it('R-21: tras cambiar la cuenta del alumno, sus solicitudes y descargas de antes siguen siendo suyas', async () => {
    await revertido(async (tx) => {
      const [alumno] = await conCuenta(tx);
      const escolar = await cuenta(tx, 'control.escolar@sce.test');
      const nueva = await tx.usuario.create({ data: { correo: 'datos.revinculo@sce.test', hashContrasena: '!' } });
      const asiento = (folio: string, accion: string, autor: string, estado?: string) =>
        tx.bitacora.create({
          data: { autor, accion, entidad: `tramite:${folio}`, valorAnterior: estado ? { estado } : undefined },
        });
      await tx.tramite.create({
        data: { folio: 'TRA-DATOS-6', matricula: alumno.matricula, tipo: 'constancia', estado: 'entregada' },
      });
      await asiento('TRA-DATOS-6', 'solicitar_tramite', alumno.usuarioId!);
      await asiento('TRA-DATOS-6', 'tomar_tramite', escolar, 'recibida');
      await asiento('TRA-DATOS-6', 'emitir_documento', escolar, 'en_proceso');
      await asiento('TRA-DATOS-6', 'entregar_documento', alumno.usuarioId!, 'lista');
      await tx.tramite.create({
        data: { folio: 'TRA-DATOS-7', matricula: alumno.matricula, tipo: 'constancia', estado: 'recibida' },
      });
      const antesDeTenerla = await asiento('TRA-DATOS-7', 'solicitar_tramite', nueva.id);
      // Lo que escribe ExpedienteService.vincularCuenta.
      await tx.alumno.update({ where: { matricula: alumno.matricula }, data: { usuarioId: nueva.id } });
      await tx.bitacora.create({
        data: {
          autor: escolar,
          accion: 'vinculo_cuenta',
          entidad: `alumno:${alumno.matricula}`,
          valorAnterior: { correo: alumno.usuario!.correo },
        },
      });

      const problemas = await tx.$queryRawUnsafe<{ tramite: string }[]>(consulta('cs-seg-06-constancia'));
      expect(problemas.filter((p) => p.tramite.startsWith('TRA-DATOS-'))).toEqual([
        {
          tramite: 'TRA-DATOS-7',
          asiento: String(antesDeTenerla.id),
          problema: 'solicitud o descarga de alguien que no era la cuenta del alumno',
        },
      ]);
    });
  });
});

describe('Tasa de conclusión de inscripción (Tabla 59) y R-08', () => {
  interface Metrica {
    iniciadas: bigint;
    concluidas: bigint;
    en_estado_explicito: bigint;
    sin_estado: bigint;
    tasa_conclusion: unknown;
  }
  const medir = async (cliente: Pick<PrismaClient, '$queryRawUnsafe'> = prisma) =>
    (await cliente.$queryRawUnsafe<Metrica[]>(consulta('tasa-conclusion')))[0];

  it('R-08: ninguna inscripción iniciada queda sin estado explícito', async () => {
    const m = await medir();
    expect(m.iniciadas).toBeGreaterThan(0n);
    expect(m.sin_estado).toBe(0n);
  });

  it('R-08: detecta una inscripción que se quedó en borrador o en validación; cuenta como iniciada y no concluida', async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        const antes = await medir(tx);
        const alumnos = await tx.alumno.findMany({
          where: { inscripciones: { none: { periodoClave: '2027A' } } },
          take: 2,
        });
        for (const [i, estado] of ['borrador', 'en_validacion'].entries()) {
          await tx.inscripcion.create({
            data: { folio: `TASA-${i}`, matricula: alumnos[i].matricula, periodoClave: '2027A', estado },
          });
        }
        const despues = await medir(tx);
        expect(despues).toMatchObject({
          iniciadas: antes.iniciadas + 2n,
          concluidas: antes.concluidas,
          en_estado_explicito: antes.en_estado_explicito,
          sin_estado: 2n,
        });
        expect(Number(despues.tasa_conclusion)).toBeCloseTo(
          (Number(despues.concluidas) * 100) / Number(despues.iniciadas),
          2,
        );
        throw new Error('revertir');
      }),
    ).rejects.toThrow('revertir');
  });
});
