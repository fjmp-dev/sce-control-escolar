-- RK-05 y AMFE de inscripcion, modos 2 y 4: la ocupacion de cada grupo es la de sus inscritos. Meta: cero filas.
-- Una inscripcion rechazada guarda la carga que se intento, pero no ocupa lugar (Fig. 4).
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/ocupacion-de-grupos.sql
SELECT g.id, g.clave, g.periodo_clave, g.ocupacion, count(i.folio) AS inscritos
  FROM grupo g
  LEFT JOIN inscripcion_grupo ig ON ig.grupo_id = g.id
  LEFT JOIN inscripcion i ON i.folio = ig.folio AND i.estado IN ('confirmada', 'ajustada', 'cerrada')
 GROUP BY g.id
HAVING g.ocupacion <> count(i.folio);
