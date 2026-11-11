-- Acceso directo a la base (Tabla 38, docs/gobierno/acceso-directo-a-la-base.md): roles con LOGIN distintos de los
-- esperados, o con atributos de mas. Cero filas es lo correcto. Se corre como postgres por el socket local.
-- Esperados: postgres (solo por socket, pg_hba.conf), sce_app (duena de la base, sin superusuario) y sce_monitor (solo
-- pg_monitor, para postgres-exporter).
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls
  FROM pg_roles
 WHERE rolcanlogin
   AND NOT (rolname = 'postgres'
        OR (rolname IN ('sce_app', 'sce_monitor')
            AND NOT (rolsuper OR rolcreaterole OR rolcreatedb OR rolreplication OR rolbypassrls)))
UNION ALL
SELECT 'sce_monitor con privilegios de mas: ' || string_agg(b.rolname, ', '), false, false, false, false, false
  FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.member JOIN pg_roles b ON b.oid = m.roleid
 WHERE r.rolname = 'sce_monitor' AND b.rolname <> 'pg_monitor'
HAVING count(*) > 0;
