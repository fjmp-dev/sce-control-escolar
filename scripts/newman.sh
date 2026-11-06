#!/usr/bin/env bash
# Contratos de API y CS-SEG-04 (Tablas 42 y 49) con Newman, contra un ambiente ya levantado (docker compose up).
# Reporte HTML, como pide la Tabla 42, y JSON. Falla si la coleccion no llego a ejecutar lo que debe.
# Uso: scripts/newman.sh [url-de-la-api] [dir-de-reportes]
set -euo pipefail

API="${1:-http://localhost:3001}"
REPORTES="${2:-reportes/newman}"
IMAGEN="postman/newman:6-alpine"
REPORTERO="newman-reporter-html@1.0.5"

mkdir -p "$REPORTES"
chmod a+rwx "$REPORTES"
docker run --rm --network host \
  -v "$PWD/api/test/contratos:/etc/newman:ro" \
  -v "$PWD/$REPORTES:/reportes" \
  --entrypoint sh "$IMAGEN" -c "
    npm install -g --silent $REPORTERO >/dev/null 2>&1
    newman run sce.postman_collection.json \
      --env-var base=$API --env-var contrasena=sce-dev-2026 \
      --reporters cli,html,json \
      --reporter-html-export /reportes/newman.html \
      --reporter-json-export /reportes/newman.json"

jq -e '.run.stats.requests.total > 0 and .run.stats.assertions.total > 0
       and .run.stats.assertions.failed == 0 and .run.stats.requests.failed == 0' "$REPORTES/newman.json" >/dev/null \
  || { echo "::error::Newman no ejecuto la coleccion o hubo fallos" >&2; exit 1; }
jq -r '"Newman: \(.run.stats.requests.total) peticiones, \(.run.stats.assertions.total) comprobaciones, 0 fallos"' \
  "$REPORTES/newman.json"
