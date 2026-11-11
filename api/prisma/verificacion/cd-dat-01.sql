-- CD-DAT-01 (Tabla 39, AU-21): matriculas duplicadas en la tabla alumno. Meta: cero filas.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cd-dat-01.sql
SELECT matricula, count(*) AS expedientes
  FROM alumno
 GROUP BY matricula
HAVING count(*) > 1;
