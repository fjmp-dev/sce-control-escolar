-- CS-SEG-06 (Tabla 49, AU-16) en pago. Meta: cero filas.
-- R-21 y Tabla 38: todo cambio de un pago deja autor, acción, valor anterior y fecha. El pago nace pendiente y sale de
-- ahí una sola vez, a aplicado o a rechazado, con un solo asiento (pago_aplicado o pago_rechazado) en la misma
-- transacción. Lo dispara la pasarela, no una persona: lo firma el usuario técnico (CC-015). El valor anterior del
-- aplicado es el saldo de la cuenta; el del rechazado, el estado pendiente.
-- Límite: no detecta un cambio hecho directo en la base sin asiento; eso lo cubre pgAudit en staging (CC-005).
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cs-seg-06-pago.sql
SELECT p.id::text AS pago, NULL AS asiento, 'pago ' || p.estado || ' sin un solo asiento de su cambio' AS problema
  FROM pago p
 WHERE p.estado <> 'pendiente'
   AND (SELECT count(*) FROM bitacora b WHERE b.entidad = 'pago:' || p.id AND b.accion = 'pago_' || p.estado) <> 1
UNION ALL
SELECT substring(b.entidad FROM 6), b.id::text, 'asiento que no corresponde al estado del pago'
  FROM bitacora b
  LEFT JOIN pago p ON 'pago:' || p.id = b.entidad
 WHERE b.accion IN ('pago_aplicado', 'pago_rechazado') AND (p.id IS NULL OR b.accion <> 'pago_' || p.estado)
UNION ALL
SELECT substring(b.entidad FROM 6), b.id::text, 'asiento sin el usuario técnico o sin valor anterior'
  FROM bitacora b
 WHERE b.accion IN ('pago_aplicado', 'pago_rechazado')
   AND (b.autor <> '5ce00000-0000-4000-8000-000000000001'
        OR (b.accion = 'pago_aplicado' AND b.valor_anterior ->> 'saldo' IS NULL)
        OR (b.accion = 'pago_rechazado' AND b.valor_anterior ->> 'estado' IS DISTINCT FROM 'pendiente'))
 ORDER BY 1, 2;
