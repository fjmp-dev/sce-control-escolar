-- Sub-batch 12.1. CC-011: momento en que la pasarela confirma el pago, para medir CD-DAT-06 (Tabla 39). Queda nula en
-- los pagos pendientes y rechazados. Los aplicados antes de esta migración toman la fecha de su abono: con la pasarela
-- simulada, la confirmación y el abono van en la misma transacción (CC-020), así que difieren en milisegundos.
ALTER TABLE pago ADD COLUMN fecha_confirmacion TIMESTAMPTZ;
UPDATE pago p
   SET fecha_confirmacion = m.fecha
  FROM movimiento m
 WHERE m.pago_id = p.id AND p.estado = 'aplicado';
