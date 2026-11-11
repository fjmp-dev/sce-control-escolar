-- CD-DAT-06 (Tabla 39): actualidad, demora entre la confirmación de un pago y su reflejo en el estado de cuenta.
-- Meta: cero filas.
-- 1. El percentil 95 de (movimiento.fecha - pago.fecha_confirmacion) de los pagos aplicados es menor a 60 s.
-- 2. Ningún pago aplicado sin fecha_confirmacion (CC-011): sin ella, su demora no se puede medir.
-- Con la pasarela simulada, la confirmación y el abono van en la misma transacción, así que la meta se cumple por
-- construcción (plan-de-sistema, 6.2, "No factible"). La fecha de confirmación la pone la base, con clock_timestamp();
-- la del abono, Prisma, con el reloj del servidor de aplicación: la demora incluye la diferencia entre los dos relojes.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cd-dat-06.sql
WITH p95 AS (
  SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY m.fecha - p.fecha_confirmacion) AS demora
    FROM pago p
    JOIN movimiento m ON m.pago_id = p.id
   WHERE p.estado = 'aplicado' AND p.fecha_confirmacion IS NOT NULL
)
SELECT 'percentil 95' AS objeto, 'demora del reflejo de 60 s o más' AS problema,
       round(extract(epoch FROM demora), 3) AS segundos
  FROM p95
 WHERE demora >= interval '60 seconds'
UNION ALL
SELECT 'pago ' || id, 'pago aplicado sin fecha de confirmación', NULL
  FROM pago
 WHERE estado = 'aplicado' AND fecha_confirmacion IS NULL
 ORDER BY 1;
