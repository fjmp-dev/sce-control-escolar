-- CD-DAT-03 (Tabla 39, AU-24): conciliación del estado de cuenta con los abonos y el corte de caja. Meta: cero filas.
-- Con la pasarela simulada (CC-020) no hay un estado de la pasarela con qué cruzar: la conciliación es interna, entre
-- las tres fuentes del SCE (plan-de-sistema, 6.2, apartado 2.1).
-- 1. El saldo de cada cuenta es la suma de sus movimientos: el cargo suma; el abono, la beca y el ajuste restan, como
--    los escribe CuentaRepository.movimiento.
-- 2. Cada pago aplicado tiene exactamente un abono, de su alumno y de su importe.
-- 3. Ningún movimiento apunta a un pago que no esté aplicado.
-- 4. El corte de cada día del calendario de la Ciudad de México (UTC-6, sin horario de verano desde 2022), recalculado
--    como lo arma PagosService.corte (pagos aplicados cuyo abono cae ese día), suma lo mismo que los abonos del día.
--    Un abono sin pago aparece aquí: está en el estado de cuenta, pero no en el corte.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/cd-dat-03.sql
WITH cuentas AS (
  SELECT c.matricula, c.saldo,
         coalesce(sum(CASE WHEN m.tipo = 'cargo' THEN m.importe ELSE -m.importe END), 0) AS movimientos
    FROM cuenta_alumno c
    LEFT JOIN movimiento m ON m.matricula = c.matricula
   GROUP BY c.matricula, c.saldo
), dias AS (
  SELECT ((m.fecha AT TIME ZONE 'UTC') - interval '6 hours')::date AS dia,
         coalesce(sum(m.importe) FILTER (WHERE m.tipo = 'abono'), 0) AS abonos,
         coalesce(sum(p.importe) FILTER (WHERE p.estado = 'aplicado'), 0) AS corte
    FROM movimiento m
    LEFT JOIN pago p ON p.id = m.pago_id
   GROUP BY 1
)
SELECT 'cuenta ' || matricula AS objeto, 'saldo distinto de la suma de sus movimientos' AS problema,
       saldo - movimientos AS diferencia
  FROM cuentas
 WHERE saldo <> movimientos
UNION ALL
SELECT 'pago ' || p.id, 'pago aplicado sin exactamente un abono de su alumno y su importe', NULL
  FROM pago p
 WHERE p.estado = 'aplicado'
   AND (SELECT count(*)
          FROM movimiento m
         WHERE m.pago_id = p.id AND m.tipo = 'abono' AND m.matricula = p.matricula AND m.importe = p.importe) <> 1
UNION ALL
SELECT 'movimiento ' || m.id, 'movimiento de un pago ' || p.estado, m.importe
  FROM movimiento m
  JOIN pago p ON p.id = m.pago_id
 WHERE p.estado <> 'aplicado'
UNION ALL
SELECT 'corte ' || dia, 'corte del día distinto de sus abonos', abonos - corte
  FROM dias
 WHERE abonos <> corte
 ORDER BY 1;
