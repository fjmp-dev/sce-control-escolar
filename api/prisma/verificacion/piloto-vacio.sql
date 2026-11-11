-- CC-022: el piloto de ensayo se despliega sin usuarios ni datos (SEMILLA=0). Despues de las migraciones solo quedan
-- los roles y el usuario tecnico de CC-015, inactivo y con un hash que ninguna contrasena satisface. Imprime una fila
-- por cada tabla con datos que no deberia tener; sin filas, el ambiente esta vacio. La corre scripts/verificar-staging.sh.
SELECT tabla || '=' || n
  FROM (SELECT table_name AS tabla,
               (xpath('/row/n/text()', query_to_xml(format('SELECT count(*) AS n FROM %I', table_name), false, true, '')))[1]::text::int AS n
          FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name NOT IN ('_prisma_migrations', 'rol')) t
 WHERE n > CASE tabla WHEN 'usuario' THEN 1 ELSE 0 END
UNION ALL
SELECT 'usuario_con_acceso=' || count(*) FROM usuario WHERE activo OR hash_contrasena <> '!' HAVING count(*) > 0
ORDER BY 1;
