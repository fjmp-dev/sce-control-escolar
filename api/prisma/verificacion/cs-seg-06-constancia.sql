-- CS-SEG-06 (Tabla 49, AU-16) en constancia: trámites y documentos (RF-007, RF-010). Meta: cero filas.
-- R-21 y Tabla 38: cada paso de la Fig. 6 deja asiento con autor, acción, valor anterior (el estado de origen) y fecha.
-- Los asientos de un trámite, en orden, forman la cadena Recibida, En proceso, Lista o Rechazada, y Entregada: cada
-- uno sale del estado en que lo dejó el anterior, y el último deja el estado actual. Solicitar y descargar los firma
-- la cuenta que el alumno del trámite tenía vinculada en ese momento (si después se cambió, la que dejó el primer
-- vinculo_cuenta posterior); tomar, emitir y rechazar, una cuenta con el rol control_escolar, que el usuario técnico no
-- tiene.
-- Límites: no detecta un cambio hecho directo en la base sin asiento; eso lo cubre pgAudit en staging (CC-005). El rol
-- se lee al consultar: hoy ningún endpoint quita un rol.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cs-seg-06-constancia.sql
WITH pasos (accion, desde, hacia) AS (
  VALUES ('solicitar_tramite', NULL, 'recibida'),
         ('tomar_tramite', 'recibida', 'en_proceso'),
         ('emitir_documento', 'en_proceso', 'lista'),
         ('rechazar_tramite', 'en_proceso', 'rechazada'),
         ('entregar_documento', 'lista', 'entregada')
), asientos AS (
  SELECT b.id, substring(b.entidad FROM 9) AS folio, b.accion, b.autor, p.desde, p.hacia,
         b.valor_anterior ->> 'estado' AS anterior,
         lag(p.hacia) OVER (PARTITION BY b.entidad ORDER BY b.id) AS previo,
         lead(b.id) OVER (PARTITION BY b.entidad ORDER BY b.id) IS NULL AS ultimo
    FROM bitacora b
    JOIN pasos p ON p.accion = b.accion
)
SELECT t.folio AS tramite, NULL AS asiento, 'trámite ' || t.estado || ' sin el asiento de su último cambio' AS problema
  FROM tramite t
  LEFT JOIN asientos a ON a.folio = t.folio AND a.ultimo
 WHERE a.hacia IS DISTINCT FROM t.estado
UNION ALL
SELECT a.folio, a.id::text, 'asiento sin trámite'
  FROM asientos a
  LEFT JOIN tramite t ON t.folio = a.folio
 WHERE t.folio IS NULL
UNION ALL
SELECT a.folio, a.id::text, 'cambio que no sale del estado en que lo dejó el asiento anterior'
  FROM asientos a
 WHERE a.anterior IS DISTINCT FROM a.desde OR a.previo IS DISTINCT FROM a.desde
UNION ALL
SELECT a.folio, a.id::text, 'solicitud o descarga de alguien que no era la cuenta del alumno'
  FROM asientos a
  JOIN tramite t ON t.folio = a.folio
  JOIN alumno al ON al.matricula = t.matricula
  LEFT JOIN LATERAL (
    SELECT true AS hubo, u.id AS cuenta
      FROM bitacora v
      LEFT JOIN usuario u ON u.correo = v.valor_anterior ->> 'correo'
     WHERE v.entidad = 'alumno:' || al.matricula AND v.accion = 'vinculo_cuenta' AND v.id > a.id
     ORDER BY v.id
     LIMIT 1
  ) entonces ON true
 WHERE a.accion IN ('solicitar_tramite', 'entregar_documento')
   AND a.autor IS DISTINCT FROM CASE WHEN entonces.hubo THEN entonces.cuenta ELSE al.usuario_id END
UNION ALL
SELECT a.folio, a.id::text, 'toma, emisión o rechazo de alguien sin el rol de control escolar'
  FROM asientos a
 WHERE a.accion IN ('tomar_tramite', 'emitir_documento', 'rechazar_tramite')
   AND NOT EXISTS (SELECT 1
                     FROM usuario_rol ur
                     JOIN rol r ON r.id = ur.rol_id
                    WHERE ur.usuario_id = a.autor AND r.clave = 'control_escolar')
UNION ALL
SELECT d.tramite_folio, NULL, 'documento sin asiento de emisión'
  FROM documento d
 WHERE NOT EXISTS (SELECT 1 FROM asientos a WHERE a.folio = d.tramite_folio AND a.accion = 'emitir_documento')
 ORDER BY 1, 2;
