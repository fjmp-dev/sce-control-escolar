-- Batch 7. CC-012: la oferta se publica despues de abrir el periodo (Fig. 7). Mientras sea nula, el alumno no la ve.
ALTER TABLE periodo ADD COLUMN oferta_publicada_en TIMESTAMPTZ;
