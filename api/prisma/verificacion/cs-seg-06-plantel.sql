-- CS-SEG-06 (Tabla 49, AU-16) en cambio de plantel. Meta: cero filas.
-- Cada asiento de cambio_plantel debe tener autor humano, un valor anterior que sea una facultad existente y un
-- expediente existente, y debe corresponder a un cambio real: su valor anterior difiere del siguiente valor
-- (el del asiento posterior o, en el ultimo, la facultad actual).
-- Limite: no detecta un cambio hecho directo en la base sin asiento; eso lo cubre pgAudit en staging (Batch 6).
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cs-seg-06-plantel.sql
WITH cambios AS (
  SELECT b.id, substring(b.entidad FROM 8) AS matricula, b.autor,
         b.valor_anterior ->> 'facultadClave' AS anterior,
         lead(b.valor_anterior ->> 'facultadClave') OVER (PARTITION BY b.entidad ORDER BY b.fecha, b.id) AS siguiente
    FROM bitacora b
   WHERE b.accion = 'cambio_plantel'
)
SELECT c.matricula, c.id::text AS asiento, 'asiento incompleto o sin expediente' AS problema
  FROM cambios c
  LEFT JOIN alumno a ON a.matricula = c.matricula
  LEFT JOIN facultad f ON f.clave = c.anterior
 WHERE a.matricula IS NULL OR f.clave IS NULL OR c.autor = '5ce00000-0000-4000-8000-000000000001'
UNION ALL
SELECT c.matricula, c.id::text, 'el asiento no corresponde a un cambio real'
  FROM cambios c
  JOIN alumno a ON a.matricula = c.matricula
 WHERE c.anterior = coalesce(c.siguiente, a.facultad_clave)
 ORDER BY 1, 2;
