#!/usr/bin/env bash
# Restauracion cronometrada (20.2, RNF-FIA-002, CO-FIA-02): reemplaza la base del ambiente con un respaldo, vuelve a
# levantar la API y el portal, y comprueba salud, conteos por tabla y CD-DAT. RTO = desde que empieza hasta que la API
# responde con los datos restaurados y migrados; meta, menos de 4 horas. Deja reportes/staging/restauracion.md.
# Uso: scripts/restauracion.sh <respaldo>
#      <respaldo> es un .dump.age de scripts/respaldo.sh (se descifra con AGE_IDENTIDAD: archivo o contenido de la
#      llave) o la ruta de un .dump en claro dentro del servidor de base (/respaldos/antes-de-...), como el que deja
#      scripts/desplegar-staging.sh antes de cada despliegue.
#      ARRANCAR=0 deja la API y el portal detenidos (lo usa scripts/rollback.sh, que despliega otra etiqueta).
#      Conexion al ambiente en AMBIENTE_ENV (por omision .staging/ambiente.env): EN_DB, EN_APP, DIR, URL y, para
#      CD-DAT, RED_DATOS y URL_DATOS.
set -euo pipefail
RESPALDO="${1:?respaldo a restaurar}"
set -a # calidad-datos.sh y curl leen RED_DATOS, URL_DATOS y CURL_CA_BUNDLE
# shellcheck disable=SC1090
[ -f "${AMBIENTE_ENV:-.staging/ambiente.env}" ] && . "${AMBIENTE_ENV:-.staging/ambiente.env}"
set +a
: "${EN_DB:?}" "${EN_APP:?}" "${DIR:?}"
REPORTES=reportes/staging
mkdir -p "$REPORTES"
falla() { echo "::error::$1" >&2; exit 1; }
app() { $EN_APP "cd '$DIR' && $1"; }
psql_db() { $EN_DB "docker exec -i -u postgres sce-db psql -d $1 -v ON_ERROR_STOP=1 -q ${2:-}"; }

inicio=$(date +%s)
app "docker compose stop api web" 2>&1 | tail -1
psql_db postgres <<'SQL'
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'sce' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS sce;
CREATE DATABASE sce OWNER sce_app;
SQL
if [[ "$RESPALDO" == *.age ]]; then
  : "${AGE_IDENTIDAD:?llave age para descifrar el respaldo}"
  llave="$AGE_IDENTIDAD"
  [ -f "$llave" ] || { llave="$(mktemp)"; chmod 600 "$llave"; printf '%s\n' "$AGE_IDENTIDAD" > "$llave"; }
  age -d -i "$llave" "$RESPALDO" | $EN_DB "docker exec -i -u postgres sce-db pg_restore -d sce --exit-on-error"
  [ "$llave" = "$AGE_IDENTIDAD" ] || rm -f "$llave"
else
  $EN_DB "docker exec -u postgres sce-db pg_restore -d sce --exit-on-error '$RESPALDO'"
fi
psql_db sce < db/pgaudit.sql # pgAudit vive en la base: se reactiva sobre la restaurada
conteos="${RESPALDO%.dump.age}.conteos"
if [ -f "$conteos" ]; then
  psql_db sce -At < api/prisma/verificacion/conteos.sql > "$REPORTES/conteos-restaurados.txt"
  diff "$conteos" "$REPORTES/conteos-restaurados.txt" || falla "los conteos no coinciden con los del respaldo"
  filas="$(awk -F'|' '{s += $2} END {print s + 0}' "$conteos") filas, iguales a las del respaldo"
else
  filas="sin conteos guardados"
fi
[ "${ARRANCAR:-1}" = 0 ] && { echo "restauracion: base reemplazada en $(($(date +%s) - inicio)) s; API detenida"; exit 0; }

# Las migraciones de la version desplegada, si el respaldo es de una anterior (sin cambios si es de la misma).
app "docker compose --profile tareas run --rm tareas" > "$REPORTES/restauracion-migraciones.txt" 2>&1
app "docker compose up -d --wait --wait-timeout 300 api web" 2>&1 | tail -1
curl -sf "${URL:?}/api/salud" | jq -e '.estado == "ok"' >/dev/null || falla "la API no responde tras restaurar"
rto=$(($(date +%s) - inicio))
if [ -n "${URL_DATOS:-}" ]; then
  scripts/calidad-datos.sh "$REPORTES/calidad-datos-restaurada" >/dev/null && cd_dat="CD-DAT en verde" || falla "CD-DAT falla sobre la base restaurada"
else
  cd_dat="CD-DAT no corrido (sin URL_DATOS)"
fi
[ "$rto" -lt 14400 ] || falla "RTO de $rto s, mayor que 4 h"
{
  echo "### Restauracion (CO-FIA-02, RNF-FIA-002)"
  echo "- Respaldo: $(basename "$RESPALDO")"
  echo "- RTO: $rto s (meta: menos de 4 h)"
  echo "- Conteos: $filas"
  echo "- $cd_dat; salud de la API: ok"
  echo "- Fecha: $(date -u +%FT%TZ)"
} | tee "$REPORTES/restauracion.md"
