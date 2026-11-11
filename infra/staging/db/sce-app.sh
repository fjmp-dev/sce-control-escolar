#!/bin/sh
# Primera inicializacion: el rol de la aplicacion, con contrasena SCRAM, y su base. No es superusuario.
set -eu
: "${SCE_APP_PASSWORD:?}"
psql -v ON_ERROR_STOP=1 --username postgres --dbname postgres -v clave="$SCE_APP_PASSWORD" <<'SQL'
CREATE ROLE sce_app LOGIN PASSWORD :'clave';
CREATE DATABASE sce OWNER sce_app;
SQL
