#!/usr/bin/env bash
# Prueba de humo del ambiente (Tabla 53, etapa 7; Anexo D): salud de API y web, e inicio de sesion por cada rol,
# tanto en la API como en el portal.
set -euo pipefail

API="${1:-http://localhost:3001}"
PORTAL="${2:-http://localhost:3000}"

curl -sf "$API/salud" | jq -e '.estado == "ok"' >/dev/null
curl -sf "$PORTAL/salud" | jq -e '.estado == "ok"' >/dev/null
echo "salud de la API y de la web: ok"

# Sin sesion, el portal no entrega paginas.
[ "$(curl -s -o /dev/null -w '%{http_code}' "$PORTAL/facultades")" = 307 ]

for cuenta in alumno profesor control.escolar coordinacion caja direccion administrador; do
  token="$(curl -sf -X POST "$API/sesiones" -H 'Content-Type: application/json' \
    -d "{\"correo\":\"$cuenta@sce.test\",\"contrasena\":\"sce-dev-2026\"}" | jq -er .token)"
  curl -sf "$API/sesiones/actual" -H "Authorization: Bearer $token" \
    | jq -e --arg rol "${cuenta/./_}" '.roles == [$rol]' >/dev/null
  curl -sf "$PORTAL/" -H "Cookie: sce_sesion=$token" | grep -q 'Entraste como'
  echo "$cuenta: inicio de sesion en la API y portal: ok"
done
