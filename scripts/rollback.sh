#!/usr/bin/env bash
# Rollback (20.2; obligatorio en la etapa 8 desde rc.2): vuelve a la etiqueta anterior con los datos de antes del ultimo
# despliegue. Restaura el respaldo previo que dejo scripts/desplegar-staging.sh (antes-de-<etiqueta actual>), despliega
# las imagenes anteriores y corre el humo. Mide el tiempo (RTO, meta menor a 4 h) y deja reportes/staging/rollback.md.
# Uso: scripts/rollback.sh <etiqueta-anterior> <imagen-api-anterior> <imagen-portal-anterior>
#      Conexion al ambiente en AMBIENTE_ENV (por omision .staging/ambiente.env); los secretos salen del .env del
#      servidor de aplicacion, el mismo con que se desplego.
set -euo pipefail
ANTERIOR="${1:?etiqueta anterior}" API_ANTERIOR="${2:?imagen de la API anterior}" PORTAL_ANTERIOR="${3:?imagen del portal anterior}"
set -a # desplegar-staging.sh las necesita exportadas
# shellcheck disable=SC1090
[ -f "${AMBIENTE_ENV:-.staging/ambiente.env}" ] && . "${AMBIENTE_ENV:-.staging/ambiente.env}"
set +a
: "${EN_DB:?}" "${EN_APP:?}" "${DIR:?}" "${URL:?}"
REPORTES=reportes/staging
mkdir -p "$REPORTES"
falla() { echo "::error::$1" >&2; exit 1; }

# Secretos y etiqueta actual del servidor de aplicacion (los escribio desplegar-staging.sh). Se leen, no se ejecutan:
# DATABASE_URL lleva "&".
env_app="$($EN_APP "cat '$DIR/.env'")"
valor() { sed -n "s/^$1=//p" <<< "$env_app"; }
for v in DOMINIO DATABASE_URL JWT_SECRET CONTRASENA_SEMILLA SEMILLA; do export "$v=$(valor "$v")"; done
ACTUAL="$(valor ETIQUETA)"
respaldo="$($EN_DB "docker exec sce-db sh -c 'ls -t /respaldos/antes-de-$ACTUAL-*.dump | head -1'")"
[ -n "$respaldo" ] || falla "no hay respaldo previo al despliegue de $ACTUAL"

inicio=$(date +%s)
ARRANCAR=0 scripts/restauracion.sh "$respaldo"
ETIQUETA="$ANTERIOR" IMAGEN_API="$API_ANTERIOR" IMAGEN_PORTAL="$PORTAL_ANTERIOR" \
  scripts/desplegar-staging.sh > "$REPORTES/rollback-despliegue.txt"
[ "${SEMILLA:-1}" = 0 ] || scripts/humo.sh "$URL/api" "$URL" > "$REPORTES/rollback-humo.txt"
curl -sf "$URL/api/salud" | jq -e '.estado == "ok"' >/dev/null || falla "la API anterior no responde"
rto=$(($(date +%s) - inicio))
[ "$rto" -lt 14400 ] || falla "rollback de $rto s, mayor que 4 h"
{
  echo "### Rollback ensayado (20.2)"
  echo "- De $ACTUAL a $ANTERIOR, con el respaldo $respaldo"
  echo "- Imagenes: $API_ANTERIOR y $PORTAL_ANTERIOR"
  echo "- Humo de la etiqueta anterior: $([ "${SEMILLA:-1}" = 0 ] && echo 'salud (sin usuarios)' || echo 'salud e inicio de sesion por rol')"
  echo "- RTO: $rto s (meta: menos de 4 h)"
  echo "- Fecha: $(date -u +%FT%TZ)"
} | tee "$REPORTES/rollback.md"
