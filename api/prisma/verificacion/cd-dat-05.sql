-- CD-DAT-05 (Tabla 39): completitud, inscripciones sin matricula, periodo o carga. Meta: cero filas.
-- La Fig. 3 da a cada inscripcion uno o mas grupos, tambien a la rechazada, que guarda la carga que se intento (CC-013).
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cd-dat-05.sql
SELECT i.folio, i.matricula, i.periodo_clave
  FROM inscripcion i
  LEFT JOIN alumno a ON a.matricula = i.matricula
  LEFT JOIN periodo p ON p.clave = i.periodo_clave
 WHERE a.matricula IS NULL
    OR p.clave IS NULL
    OR NOT EXISTS (SELECT 1 FROM inscripcion_grupo g WHERE g.folio = i.folio);
