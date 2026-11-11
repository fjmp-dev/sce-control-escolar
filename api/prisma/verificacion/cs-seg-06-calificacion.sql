-- CS-SEG-06 (Tabla 49, AU-16) en calificacion. Meta: cero filas.
-- 14.1-3 y Tabla 16 (Credibilidad, Trazabilidad): toda calificacion tiene asiento de captura o de correccion; cada
-- captura la firma el profesor del grupo, y cada correccion (D-17) una persona, con valor anterior, motivo y evidencia.
-- Limite: no detecta un cambio hecho directo en la base sin asiento; eso lo cubre pgAudit en staging (CC-005).
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cs-seg-06-calificacion.sql
SELECT c.id::text AS calificacion, NULL AS asiento, 'calificacion sin asiento de captura' AS problema
  FROM calificacion c
 WHERE NOT EXISTS (
         SELECT 1 FROM bitacora b WHERE b.entidad = 'calificacion:' || c.id AND b.accion = 'captura_calificacion')
UNION ALL
SELECT substring(b.entidad FROM 14), b.id::text, 'asiento sin calificacion'
  FROM bitacora b
  LEFT JOIN calificacion c ON 'calificacion:' || c.id = b.entidad
 WHERE b.accion IN ('captura_calificacion', 'correccion_calificacion') AND c.id IS NULL
UNION ALL
SELECT c.id::text, b.id::text, 'captura de alguien que no es el profesor del grupo'
  FROM bitacora b
  JOIN calificacion c ON 'calificacion:' || c.id = b.entidad
  JOIN grupo g ON g.id = c.grupo_id
 WHERE b.accion = 'captura_calificacion' AND b.autor <> g.profesor_id
UNION ALL
SELECT substring(b.entidad FROM 14), b.id::text, 'correccion sin autor humano, valor anterior, motivo o evidencia'
  FROM bitacora b
 WHERE b.accion = 'correccion_calificacion'
   AND (b.autor = '5ce00000-0000-4000-8000-000000000001'
        OR b.valor_anterior ->> 'valor' IS NULL
        OR coalesce(b.valor_anterior ->> 'motivo', '') = ''
        OR coalesce(b.valor_anterior ->> 'evidencia', '') = '')
 ORDER BY 1, 2;
