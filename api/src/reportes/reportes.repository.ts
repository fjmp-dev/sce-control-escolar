import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../persistencia/prisma.service';
import { Totales } from './dominio/indicadores';

type Fila = { [K in keyof Totales]: Totales[K] | bigint };

/**
 * Fig. 2: reportes lee por persistencia, en solo lectura. Una fila por facultad y una de toda la universidad
 * (`GROUPING SETS`), sumadas en enteros para que el redondeo sea uno solo, el del dominio.
 */
@Injectable()
export class ReportesRepository {
  constructor(private readonly prisma: PrismaService) {}

  existePeriodo(clave: string) {
    return this.prisma.cliente().periodo.count({ where: { clave } });
  }

  async porFacultad(periodo: string): Promise<Totales[]> {
    const filas = await this.prisma.cliente().$queryRaw<Fila[]>(Prisma.sql`
      WITH a AS (
        SELECT al.matricula, al.facultad_clave, al.estatus,
               COALESCE(h.promedio, 0) AS promedio, COALESCE(h.avance, 0) AS avance, COALESCE(c.saldo, 0) AS saldo,
               EXISTS (SELECT 1 FROM inscripcion x WHERE x.matricula = al.matricula AND x.estado = 'cerrada')
                 AS con_historial,
               i.estado AS inscripcion
        FROM alumno al
        LEFT JOIN historial h ON h.matricula = al.matricula
        LEFT JOIN cuenta_alumno c ON c.matricula = al.matricula
        LEFT JOIN inscripcion i ON i.matricula = al.matricula AND i.periodo_clave = ${periodo}
      ), m AS (
        SELECT matricula,
               SUM(importe) FILTER (WHERE tipo = 'cargo') AS cargos,
               SUM(importe) FILTER (WHERE tipo = 'abono') AS pagado,
               SUM(importe) FILTER (WHERE tipo = 'beca') AS becas
        FROM movimiento GROUP BY matricula
      )
      SELECT f.clave AS "facultadClave", f.nombre AS "facultadNombre",
             COUNT(a.matricula) FILTER (WHERE a.estatus = 'activo')::int AS activos,
             COUNT(a.matricula) FILTER (WHERE a.inscripcion IN ('confirmada', 'ajustada', 'cerrada'))::int AS inscritos,
             COUNT(a.matricula) FILTER (WHERE a.con_historial)::int AS "conHistorial",
             COALESCE(SUM(a.promedio * 100) FILTER (WHERE a.con_historial), 0)::bigint AS "sumaPromedios",
             COALESCE(SUM(a.avance * 100) FILTER (WHERE a.estatus = 'activo'), 0)::bigint AS "sumaAvance",
             COALESCE(SUM(m.cargos * 100), 0)::bigint AS cargos,
             COALESCE(SUM(m.pagado * 100), 0)::bigint AS pagado,
             COALESCE(SUM(m.becas * 100), 0)::bigint AS becas,
             COALESCE(SUM(GREATEST(a.saldo, 0) * 100), 0)::bigint AS pendiente,
             COUNT(a.matricula) FILTER (WHERE a.saldo > 0)::int AS "conAdeudo"
      FROM facultad f
      LEFT JOIN a ON a.facultad_clave = f.clave
      LEFT JOIN m ON m.matricula = a.matricula
      GROUP BY GROUPING SETS ((f.clave, f.nombre), ())
      ORDER BY f.clave NULLS LAST`);
    return filas.map(
      (f) =>
        Object.fromEntries(
          Object.entries(f).map(([k, v]) => [k, typeof v === 'bigint' ? Number(v) : v]),
        ) as unknown as Totales,
    );
  }
}
