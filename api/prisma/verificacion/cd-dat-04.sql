-- CD-DAT-04 (Tabla 39, AU-22): calificaciones sin grupo, periodo o profesor. Meta: cero filas.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cd-dat-04.sql
SELECT c.id, c.grupo_id, c.periodo_clave, c.profesor_id
  FROM calificacion c
  LEFT JOIN grupo g ON g.id = c.grupo_id
  LEFT JOIN periodo p ON p.clave = c.periodo_clave
  LEFT JOIN usuario u ON u.id = c.profesor_id
 WHERE g.id IS NULL OR p.clave IS NULL OR u.id IS NULL;
