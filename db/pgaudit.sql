-- Auditoria de base de datos con pgAudit (https://www.pgaudit.org)
-- Manual SCE-MC-001: sec. 18 (seguridad), RNF-SEG-001, ISO/IEC 27001 A.8.15.
--
-- Complementa a la tabla bitacora: bitacora registra lo que hace la
-- aplicacion; pgAudit registra lo que llega a PostgreSQL por cualquier via
-- (psql, migraciones, un DBA), que es lo que la aplicacion no puede ver.
--
-- Se corre como superusuario, dos veces la primera vez:
--   psql -d sce -f db/pgaudit.sql   -> activa la libreria; reiniciar PostgreSQL
--   psql -d sce -f db/pgaudit.sql   -> crea la extension y las reglas
-- Es idempotente: se reejecuta antes y despues de cada migracion (scripts/desplegar-staging.sh lo hace).

\set ON_ERROR_STOP on

SELECT current_setting('shared_preload_libraries') ~ 'pgaudit' AS cargado \gset
\if :cargado
\else
  ALTER SYSTEM SET shared_preload_libraries = 'pgaudit';
  \echo 'pgaudit agregado a shared_preload_libraries. Reinicia PostgreSQL y vuelve a correr este script.'
  \quit
\endif

CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Auditoria de sesion, para todo el servidor: cambios de esquema (DDL) y de
-- roles y permisos (GRANT, REVOKE, CREATE/ALTER ROLE).
ALTER SYSTEM SET pgaudit.log = 'ddl, role';
ALTER SYSTEM SET pgaudit.log_relation = on;   -- una linea por tabla tocada
ALTER SYSTEM SET pgaudit.log_catalog = off;   -- sin ruido de pg_catalog
-- Sin parametros en el log: llevarian datos personales y hashes de
-- contrasena (RNF-SEG-002, caso CS-SEG-08).
ALTER SYSTEM SET pgaudit.log_parameter = off;

-- Auditoria de objeto: toda escritura sobre las tablas que el manual
-- considera registro oficial (principio 6 de la politica de calidad) queda
-- en el log, la haga quien la haga. pgAudit audita lo que sce_auditor
-- tendria permitido; el rol no inicia sesion.
SELECT NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sce_auditor') AS crear_rol \gset
\if :crear_rol
  CREATE ROLE sce_auditor NOLOGIN;
\endif
ALTER SYSTEM SET pgaudit.role = 'sce_auditor';

-- Solo las tablas que ya existen: el despliegue corre este script antes de migrar, para que pgAudit registre el DDL de
-- las migraciones, y despues, para auditar las tablas nuevas.
DO $$
DECLARE
  tabla text;
BEGIN
  FOREACH tabla IN ARRAY ARRAY[
    'calificacion', 'historial',             -- RF-004, RF-005
    'pago', 'movimiento', 'cuenta_alumno',   -- RF-006
    'tramite', 'documento',                  -- RF-007
    'usuario', 'usuario_rol', 'rol',         -- RF-008
    'alumno', 'bitacora'                     -- RF-001, RNF-SEG-001
  ] LOOP
    IF to_regclass(tabla) IS NOT NULL THEN
      EXECUTE format('GRANT INSERT, UPDATE, DELETE ON %I TO sce_auditor', tabla);
    END IF;
  END LOOP;
END $$;

-- Contexto en cada linea del log: hora, proceso, usuario@base y aplicacion.
ALTER SYSTEM SET log_line_prefix = '%m [%p] %q%u@%d %a ';
-- PostgreSQL 16 (Tabla 7) solo acepta on u off; la lista de PostgreSQL 18 ('authentication') falla aqui.
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

SELECT pg_reload_conf();
