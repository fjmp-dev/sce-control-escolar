-- Filas por tabla del esquema publico (CO-FIA-02). scripts/respaldo.sh las guarda junto al respaldo y
-- scripts/restauracion.sh las compara despues de restaurar: si falta o sobra una fila, la restauracion no cumple.
SELECT table_name || '|' || (xpath('/row/n/text()',
         query_to_xml(format('SELECT count(*) AS n FROM %I', table_name), false, true, '')))[1]::text
  FROM information_schema.tables
 WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
 ORDER BY table_name;
