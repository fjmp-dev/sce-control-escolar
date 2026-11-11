-- Batch 9: el rechazo de un tramite lleva su motivo visible (Fig. 6) y el documento guarda el contenido emitido, que no
-- cambia y del que sale su hash SHA-256.
ALTER TABLE tramite ADD COLUMN motivo_rechazo TEXT;
ALTER TABLE tramite
  ADD CONSTRAINT ck_tramite_estado CHECK (estado IN ('recibida', 'en_proceso', 'lista', 'entregada', 'rechazada'));
ALTER TABLE tramite
  ADD CONSTRAINT ck_tramite_motivo CHECK ((estado = 'rechazada') = (motivo_rechazo IS NOT NULL));
ALTER TABLE documento ADD COLUMN contenido TEXT NOT NULL DEFAULT '';
