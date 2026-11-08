#!/usr/bin/env bash
# CS-SEG-05 (Tabla 49) con OWASP ZAP: escaneo activo de la API a partir de su OpenAPI, contra un ambiente ya
# levantado con docker compose (Tabla 30). Informe por severidad (Tabla 42). Criterio: cero altas (Tabla 51, AU-20),
# ningun 5xx y base intacta. Falla si ZAP no llego a probar la API autenticada.
# Uso: scripts/zap.sh [dir-de-reportes]
set -euo pipefail

API="http://localhost:3001"
REPORTES="${1:-reportes/zap}"
IMAGEN="ghcr.io/zaproxy/zaproxy:2.17.0"

mkdir -p "$REPORTES"
chmod a+rwx "$REPORTES"

# Con esas dos operaciones el propio escaneo revocaria el token y el resto solo veria 401.
jq 'del(.paths["/sesiones/actual"].delete, .paths["/usuarios/actual/contrasena"])' docs/api/openapi.json \
  > "$REPORTES/openapi-zap.json"

iniciar() {
  curl -sf -X POST "$API/sesiones" -H 'Content-Type: application/json' \
    -d "{\"correo\":\"$1\",\"contrasena\":\"$2\"}" | jq -er .token
}

# Cuenta del escaneo, con los roles que escriben: administrador, coordinacion y control escolar. Con menos, los
# endpoints de los demas responden 403 antes de validar la entrada, y esa validacion quedaria sin probar. 409 si el ambiente ya la tiene.
ADMIN="$(iniciar administrador@sce.test sce-dev-2026)"
CONTRASENA_ZAP="sintetica-de-zap-1"
alta="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API/usuarios" \
  -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' \
  -d "{\"confirmacion\":\"sce-dev-2026\",\"correo\":\"escaneo@sce.test\",\"contrasena\":\"$CONTRASENA_ZAP\",\"roles\":[\"administrador\",\"coordinacion\",\"control_escolar\"]}")"
[ "$alta" = 201 ] || [ "$alta" = 409 ] || { echo "::error::alta de la cuenta del escaneo: $alta" >&2; exit 1; }
TOKEN="$(iniciar escaneo@sce.test "$CONTRASENA_ZAP")"

estado=0
docker run --rm --network host -v "$PWD/$REPORTES:/zap/wrk:rw" "$IMAGEN" zap-api-scan.py \
  -t openapi-zap.json -f openapi -O "$API" -I \
  -r zap.html -J zap.json -w zap.md \
  -z "-config replacer.full_list(0).description=token \
      -config replacer.full_list(0).enabled=true \
      -config replacer.full_list(0).matchtype=REQ_HEADER \
      -config replacer.full_list(0).matchstr=Authorization \
      -config replacer.full_list(0).regex=false \
      -config replacer.full_list(0).replacement=Bearer\ $TOKEN" || estado=$?
[ "$estado" -eq 0 ] || { echo "::error::zap-api-scan termino con codigo $estado" >&2; exit 1; }

# Falla cerrada: el registro de la API dice que recibio y que contesto.
docker compose logs --no-log-prefix api > "$REPORTES/registros-api.txt"
jq -Rc 'fromjson? | select(.context == "Peticiones") | .message' "$REPORTES/registros-api.txt" > "$REPORTES/peticiones.jsonl"
jq -s '{
    peticiones: length,
    autenticadas: (map(select(.usuario != null)) | length),
    por_estado: (group_by(.estado) | map({key: (.[0].estado | tostring), value: length}) | from_entries),
    errores_5xx: (map(select(.estado >= 500)) | length)
  }' "$REPORTES/peticiones.jsonl" | tee "$REPORTES/resumen-peticiones.json"
jq -e '.peticiones > 200 and .autenticadas > 100' "$REPORTES/resumen-peticiones.json" >/dev/null \
  || { echo "::error::ZAP no llego a probar la API autenticada" >&2; exit 1; }
jq -e '.errores_5xx == 0' "$REPORTES/resumen-peticiones.json" >/dev/null \
  || { echo "::error::una entrada produjo un error 5xx" >&2; exit 1; }

# El token debe seguir vigente; si no, parte del escaneo solo vio 401.
curl -sf "$API/sesiones/actual" -H "Authorization: Bearer $TOKEN" -o /dev/null \
  || { echo "::error::el token se revoco durante el escaneo" >&2; exit 1; }

# La base no se corrompio: las consultas de calidad de datos siguen en cero filas.
for consulta in cd-dat-01 cd-dat-04; do
  docker compose exec -T db psql -U sce_app -d sce -v ON_ERROR_STOP=1 -At < "api/prisma/verificacion/$consulta.sql" > "$REPORTES/$consulta.txt"
  [ ! -s "$REPORTES/$consulta.txt" ] || { echo "::error::$consulta encontro filas tras el escaneo" >&2; exit 1; }
done

# CS-SEG-08: tras miles de peticiones con token y contrasena, los registros no llevan ninguno.
if grep -nE "sce-dev-2026|$CONTRASENA_ZAP|"'eyJ[A-Za-z0-9_-]{10,}|\$2[aby]\$|postgresql://' "$REPORTES/registros-api.txt"; then
  echo "::error::los registros de la API contienen datos sensibles" >&2
  exit 1
fi

# Severidad: riskcode 3 = alta. Las medias y bajas quedan en el informe.
altas="$(jq '[.site[].alerts[] | select(.riskcode == "3")] | length' "$REPORTES/zap.json")"
jq -r '.site[].alerts[] | "\(.riskdesc): \(.name) (\(.count))"' "$REPORTES/zap.json" | sort
echo "ZAP: $altas alertas altas"
[ "$altas" -eq 0 ] || { echo "::error::ZAP encontro $altas alertas altas" >&2; exit 1; }
