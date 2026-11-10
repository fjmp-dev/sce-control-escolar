-- CD-DAT-02 (Tabla 39, RF-005, AU-23): recalculo independiente del historial, en SQL y no con la funcion del dominio,
-- con las calificaciones de periodos cerrados. Meta: cero filas; cada fila es un historial que no coincide.
-- Reglas: D-5 (final = promedio de parciales; si se recursa, cuenta el ultimo intento; promedio = promedio de finales;
-- redondeo half-up a centesimas, que es el de round() de PostgreSQL con positivos) y D-8 (avance contra el plan de
-- la materia cursada mas reciente, con tope de 100). La muestra del manual es de 30 expedientes: aqui son todos.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cd-dat-02.sql
WITH intentos AS (
  SELECT c.folio, g.materia_clave, p.fecha_inicio, round(avg(c.valor * 100)) AS final
    FROM calificacion c
    JOIN grupo g ON g.id = c.grupo_id
    JOIN periodo p ON p.clave = c.periodo_clave
   WHERE p.estado = 'cerrado'
   GROUP BY c.folio, g.materia_clave, p.fecha_inicio
), del_alumno AS (
  SELECT i.matricula, t.final, m.creditos, pe.creditos_totales,
         row_number() OVER (PARTITION BY i.matricula, t.materia_clave ORDER BY t.fecha_inicio DESC) AS intento,
         row_number() OVER (PARTITION BY i.matricula ORDER BY t.fecha_inicio DESC) AS reciente
    FROM intentos t
    JOIN inscripcion i ON i.folio = t.folio
    JOIN materia m ON m.clave = t.materia_clave
    JOIN plan_estudios pe ON pe.clave = m.plan_clave
), esperado AS (
  SELECT matricula,
         round(avg(final) FILTER (WHERE intento = 1)) / 100 AS promedio,
         coalesce(sum(creditos) FILTER (WHERE intento = 1 AND final >= 600), 0) AS creditos,
         least(10000, round(coalesce(sum(creditos) FILTER (WHERE intento = 1 AND final >= 600), 0) * 10000.0
                            / max(creditos_totales) FILTER (WHERE reciente = 1))) / 100 AS avance
    FROM del_alumno
   GROUP BY matricula
)
SELECT h.matricula,
       h.promedio AS promedio_guardado, coalesce(e.promedio, 0) AS promedio_esperado,
       h.creditos_acumulados AS creditos_guardados, coalesce(e.creditos, 0) AS creditos_esperados,
       h.avance AS avance_guardado, coalesce(e.avance, 0) AS avance_esperado
  FROM historial h
  LEFT JOIN esperado e ON e.matricula = h.matricula
 WHERE h.promedio <> coalesce(e.promedio, 0)
    OR h.creditos_acumulados <> coalesce(e.creditos, 0)
    OR h.avance <> coalesce(e.avance, 0)
 ORDER BY h.matricula;
