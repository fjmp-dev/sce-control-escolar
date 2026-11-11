#!/usr/bin/env bash
# CS-SEG-05 (Tabla 49) con OWASP ZAP: escaneo activo de la API a partir de su OpenAPI, contra un ambiente ya levantado con
# docker compose (Tabla 30). Un escaneo por rol, con la cuenta sintética de cada uno (README) y solo las operaciones que
# la matriz rol × endpoint le permite: así cada operación llega a su validación y a su regla de negocio, no solo al 403.
# Al final, con una cuenta desechable, las dos operaciones que revocan la sesión. Informe por severidad (Tabla 42).
# Criterios: ninguna operación del OpenAPI recibe solo 401 o 403, cero altas (Tabla 51, AU-20), ningún 5xx, registros sin
# datos sensibles (CS-SEG-08) y la calidad de datos completa (scripts/calidad-datos.sh) sigue en verde tras el escaneo.
# Uso: [API=http://localhost:3001] [CONTRASENA_SEMILLA=...] scripts/zap.sh [dir-de-reportes]
#      Deja bloqueada 15 minutos la cuenta del administrador (Tabla 38): ZAP falla a propósito su confirmación de
#      contraseña. Lo que necesite esa cuenta en el mismo ambiente corre antes (ci.yml, zap-completo.yml).
set -euo pipefail

API="${API:-http://localhost:3001}"
REPORTES="${1:-reportes/zap}"
IMAGEN="ghcr.io/zaproxy/zaproxy:2.17.0"
CONTRASENA="${CONTRASENA_SEMILLA:-sce-dev-2026}"
# Las columnas de la matriz, en su orden. El administrador va al final por el bloqueo.
ROLES=(alumno profesor control.escolar coordinacion caja direccion administrador)
REVOCAN='^(delete /sesiones/actual|put /usuarios/actual/contrasena)$'

rm -rf "$REPORTES"
mkdir -p "$REPORTES"
chmod a+rwx "$REPORTES"
antes="$(docker compose logs --no-log-prefix api | wc -l)" # el registro de la API cuenta desde aquí

iniciar() {
  curl -sf -X POST "$API/sesiones" -H 'Content-Type: application/json' \
    -d "{\"correo\":\"$1\",\"contrasena\":\"$2\"}" | jq -er .token
}

# "get /alumnos/actual", una por línea: las que la columna $1 de la matriz (1 = alumno) marca con Sí, y también las
# públicas si $2 = 1. Las públicas se escanean una sola vez, con el primer rol.
operaciones_de() {
  awk -F'|' -v c="$(($1 + 3))" -v publicas="$2" '$2 ~ /^ (GET|POST|PUT|PATCH|DELETE) $/ {
    v = $c; gsub(/ /, "", v)
    if (v == "Sí" || (publicas == 1 && v == "Público")) { m = $2; r = $3; gsub(/[ `]/, "", m); gsub(/[ `]/, "", r); print tolower(m) " " r }
  }' docs/calidad/matriz-rol-endpoint.md
}

# El OpenAPI con solo las operaciones que llegan por la entrada estándar.
reducir() {
  jq --rawfile ops /dev/stdin '($ops | split("\n") | map(select(length > 0))) as $ops
    | .paths |= with_entries(.key as $r | .value |= with_entries(select("\(.key) \($r)" | IN($ops[])))
      | select(.value | length > 0))' docs/api/openapi.json
}

# Fija el parámetro de ruta $2 de la plantilla $1 en el valor $3: ZAP prueba ese recurso y no uno inventado.
fijar() {
  jq --arg ruta "$1" --arg param "$2" --arg valor "$3" 'if .paths[$ruta] then
      .paths[$ruta | sub("\\{" + $param + "\\}"; $valor)] = (.paths[$ruta] | map_values(.parameters |= map(select(.name != $param))))
      | del(.paths[$ruta])
    else . end'
}

# zap-api-scan.py sobre $REPORTES/$1.json con el token $2.
escanear() {
  local estado=0
  docker run --rm --network host -v "$PWD/$REPORTES:/zap/wrk:rw" "$IMAGEN" zap-api-scan.py \
    -t "$1.json" -f openapi -O "$API" -I -r "$1.html" -J "$1-alertas.json" -w "$1.md" \
    -z "-config replacer.full_list(0).description=token \
        -config replacer.full_list(0).enabled=true \
        -config replacer.full_list(0).matchtype=REQ_HEADER \
        -config replacer.full_list(0).matchstr=Authorization \
        -config replacer.full_list(0).regex=false \
        -config replacer.full_list(0).replacement=Bearer\ $2" > "$REPORTES/$1.txt" 2>&1 || estado=$?
  [ "$estado" -eq 0 ] || { tail -20 "$REPORTES/$1.txt"; echo "::error::zap-api-scan ($1) terminó con código $estado" >&2; exit 1; }
  echo "$1: $(grep -h '^FAIL-NEW:' "$REPORTES/$1.txt")"
}

vigente() {
  curl -sf "$API/sesiones/actual" -H "Authorization: Bearer $2" -o /dev/null \
    || { echo "::error::el token de $1 se revocó o venció durante su escaneo: parte de él solo vio 401" >&2; exit 1; }
}

# Cuenta desechable para las operaciones que revocan la sesión. Se da de alta antes del escaneo del administrador, que
# bloquea su confirmación, y es nueva en cada corrida porque sus confirmaciones fallidas también la bloquean.
CONTRASENA_ZAP="sintetica-de-zap-1"
DESECHABLE="zap-$(date +%s)@sce.test"
alta="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API/usuarios" \
  -H "Authorization: Bearer $(iniciar administrador@sce.test "$CONTRASENA")" -H 'Content-Type: application/json' \
  -d "{\"confirmacion\":\"$CONTRASENA\",\"correo\":\"$DESECHABLE\",\"contrasena\":\"$CONTRASENA_ZAP\",\"roles\":[\"alumno\"]}")"
[ "$alta" = 201 ] || { echo "::error::alta de la cuenta desechable: $alta" >&2; exit 1; }

for i in "${!ROLES[@]}"; do
  rol="${ROLES[$i]}"
  token="$(iniciar "$rol@sce.test" "$CONTRASENA")"
  operaciones_de "$((i + 1))" "$([ "$i" -eq 0 ] && echo 1 || echo 0)" | grep -Ev "$REVOCAN" | reducir > "$REPORTES/$rol.json"
  if [ "$rol" = profesor ]; then # con un grupo ajeno, la captura respondería 403 GRUPO_NO_ASIGNADO
    grupo="$(curl -sf "$API/profesores/actual/grupos" -H "Authorization: Bearer $token" | jq -er '.[0].id')"
    fijar '/grupos/{id}/calificaciones' id "$grupo" < "$REPORTES/$rol.json" > "$REPORTES/fijado.json"
    mv "$REPORTES/fijado.json" "$REPORTES/$rol.json"
  fi
  escanear "$rol" "$token"
  vigente "$rol" "$token"
done

# Al final, primero el cambio de contraseña (sus confirmaciones fallidas no revocan) y luego el cierre de sesión, que
# revoca todo token de la cuenta. Cada uno con su propio token.
echo "put /usuarios/actual/contrasena" | reducir > "$REPORTES/contrasena.json"
echo "delete /sesiones/actual" | reducir > "$REPORTES/cierre.json"
token_contrasena="$(iniciar "$DESECHABLE" "$CONTRASENA_ZAP")"
token_cierre="$(iniciar "$DESECHABLE" "$CONTRASENA_ZAP")"
escanear contrasena "$token_contrasena"
vigente contrasena "$token_contrasena"
escanear cierre "$token_cierre"

# Falla cerrada: el registro de la API dice qué recibió y qué contestó, operación por operación.
docker compose logs --no-log-prefix api | tail -n "+$((antes + 1))" > "$REPORTES/registros-api.txt"
jq -Rc 'fromjson? | select(.context == "Peticiones") | .message' "$REPORTES/registros-api.txt" > "$REPORTES/peticiones.jsonl"
jq -s '{
    peticiones: length,
    autenticadas: (map(select(.usuario != null)) | length),
    por_estado: (group_by(.estado) | map({key: (.[0].estado | tostring), value: length}) | from_entries),
    errores_5xx: (map(select(.estado >= 500)) | length),
    por_operacion: (group_by("\(.metodo) \(.ruta)") | map({key: "\(.[0].metodo) \(.[0].ruta)",
      value: (group_by(.estado) | map({key: (.[0].estado | tostring), value: length}) | from_entries)}) | from_entries)
  }' "$REPORTES/peticiones.jsonl" > "$REPORTES/resumen-peticiones.json"
jq -c '{peticiones, autenticadas, por_estado, errores_5xx}' "$REPORTES/resumen-peticiones.json"
jq -e '.peticiones > 1000 and .autenticadas > 500' "$REPORTES/resumen-peticiones.json" >/dev/null \
  || { echo "::error::ZAP no llegó a probar la API autenticada" >&2; exit 1; }
jq -e '.errores_5xx == 0' "$REPORTES/resumen-peticiones.json" >/dev/null \
  || { echo "::error::una entrada produjo un error 5xx" >&2; exit 1; }

# Ninguna operación del OpenAPI se queda en la autorización: cada una recibió al menos una respuesta que no es 401 ni 403.
jq -r '.paths | to_entries[] | .key as $r | .value | keys[] | "\(ascii_upcase) \($r | gsub("\\{(?<p>[^}]+)\\}"; ":\(.p)"))"' \
  docs/api/openapi.json | sort -u > "$REPORTES/operaciones.txt"
jq -r 'select(.estado != 401 and .estado != 403) | "\(.metodo) \(.ruta)"' "$REPORTES/peticiones.jsonl" | sort -u \
  | comm -23 "$REPORTES/operaciones.txt" - > "$REPORTES/solo-401-403.txt"
if [ -s "$REPORTES/solo-401-403.txt" ]; then
  cat "$REPORTES/solo-401-403.txt"
  echo "::error::$(wc -l < "$REPORTES/solo-401-403.txt" | tr -d ' ') operaciones solo recibieron 401 o 403" >&2
  exit 1
fi
echo "Las $(wc -l < "$REPORTES/operaciones.txt" | tr -d ' ') operaciones del OpenAPI pasaron de la autorización"

# CS-SEG-08: tras miles de peticiones con token y contraseña, los registros no llevan ninguno.
if grep -nE "$CONTRASENA|$CONTRASENA_ZAP|"'eyJ[A-Za-z0-9_-]{10,}|\$2[aby]\$|postgresql://' "$REPORTES/registros-api.txt"; then
  echo "::error::los registros de la API contienen datos sensibles" >&2
  exit 1
fi

# La base no se corrompió: CD-DAT-01 a 06, Tabla 16 y CS-SEG-06 completos, como en la etapa 4.
scripts/calidad-datos.sh "$REPORTES/calidad-datos"

# Severidad: riskcode 3 = alta. Las medias y bajas quedan en el informe (docs/calidad/informe-zap.md).
jq -s '[.[].site[].alerts[]] | group_by(.pluginid) | map({pluginid: .[0].pluginid, alerta: .[0].name,
    riesgo: .[0].riskdesc, riskcode: .[0].riskcode, instancias: (map(.count | tonumber) | add)})' \
  "$REPORTES"/*-alertas.json > "$REPORTES/alertas.json"
jq -r '.[] | "\(.riesgo): \(.alerta) [\(.pluginid)] (\(.instancias))"' "$REPORTES/alertas.json" | sort
altas="$(jq '[.[] | select(.riskcode == "3")] | length' "$REPORTES/alertas.json")"
echo "ZAP: $altas alertas altas"
[ "$altas" -eq 0 ] || { echo "::error::ZAP encontró $altas alertas altas" >&2; exit 1; }
