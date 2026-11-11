#!/bin/sh
# Primera inicializacion: el rol de la aplicacion y el del monitoreo, con contrasena SCRAM, y la base. Ninguno es
# superusuario; sce_monitor solo lee estadisticas (pg_monitor) para postgres-exporter (infra/monitoreo). Son los unicos
# roles con LOGIN ademas de postgres (docs/gobierno/acceso-directo-a-la-base.md, roles-login.sql).
set -eu
: "${SCE_APP_PASSWORD:?}" "${SCE_MONITOR_PASSWORD:?}"
psql -v ON_ERROR_STOP=1 --username postgres --dbname postgres -v clave="$SCE_APP_PASSWORD" \
  -v monitor="$SCE_MONITOR_PASSWORD" <<'SQL'
CREATE ROLE sce_app LOGIN PASSWORD :'clave';
CREATE ROLE sce_monitor LOGIN PASSWORD :'monitor' CONNECTION LIMIT 3 IN ROLE pg_monitor;
CREATE DATABASE sce OWNER sce_app;
SQL
