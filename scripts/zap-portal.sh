#!/usr/bin/env bash
# Escaneo completo del portal con OWASP ZAP (zap-full-scan: spider, escaneo pasivo y activo) con la sesión de cada rol en
# la cookie httpOnly sce_sesion, como la deja el ingreso. zap.sh ataca la API; aquí se prueban las páginas de Next.js, sus
# parámetros y sus cabeceras (CSP con nonce, cookies). Criterios: cero altas (Tabla 51), ningún 5xx de la API detrás de
# las páginas, ningún rechazo de la API que el portal no maneje (Next.js lo registra con "⨯ ErrorApi" y responde 500),
# el portal llamó a la API con la sesión del rol y esa sesión sigue viva al terminar (si no, parte del escaneo solo vio
# /ingresar). El spider no envía formularios POST, que son acciones de servidor: la API de cada acción la
# ataca zap.sh, y el rechazo de una acción desde otro origen lo prueba web/playwright/sesion.spec.ts. La regla de DOM XSS
# (40026) sí las ejecuta, porque abre un navegador y pulsa los botones; a la de "Cerrar sesión" se le cambia el
# identificador en cada petición, para que Next.js no la encuentre y la sesión siga viva.
# Contra un ambiente ya levantado con docker compose. Lo corre zap-completo.yml (manual, semanal y en cada v*-rc.*).
# Uso: [API=...] [PORTAL=...] [ROLES="alumno caja"] [CONTRASENA_SEMILLA=...] scripts/zap-portal.sh [dir-de-reportes]
set -euo pipefail

API="${API:-http://localhost:3001}"
PORTAL="${PORTAL:-http://localhost:3000}"
REPORTES="${1:-reportes/zap-portal}"
IMAGEN="ghcr.io/zaproxy/zaproxy:2.17.0"
CONTRASENA="${CONTRASENA_SEMILLA:-sce-dev-2026}"
read -r -a ROLES <<< "${ROLES:-alumno profesor control.escolar coordinacion caja direccion administrador}"

rm -rf "$REPORTES"
mkdir -p "$REPORTES"
chmod a+rwx "$REPORTES"

for rol in "${ROLES[@]}"; do
  token="$(curl -sf -X POST "$API/sesiones" -H 'Content-Type: application/json' \
    -d "{\"correo\":\"$rol@sce.test\",\"contrasena\":\"$CONTRASENA\"}" | jq -er .token)"
  usuario="$(curl -sf "$API/sesiones/actual" -H "Authorization: Bearer $token" | jq -er .id)"
  cierre="$(curl -sf "$PORTAL/" -H "Cookie: sce_sesion=$token" | grep -oE '[$]ACTION_ID_[0-9a-f]+' | head -1 | cut -c12-)"
  [ -n "$cierre" ] || { echo "::error::no se encontró la acción de cerrar sesión en el portal ($rol)" >&2; exit 1; }
  antes="$(docker compose logs --no-log-prefix api | wc -l)"
  antes_web="$(docker compose logs --no-log-prefix web | wc -l)"
  # Spider de 2 minutos y escaneo activo de 10 como máximo: la sesión del administrador dura 15 (Tabla 38). Dos hilos:
  # la regla de DOM XSS abre un Firefox por hilo, y con los de omisión ZAP se quedó sin memoria.
  estado=0
  docker run --rm --network host -v "$PWD/$REPORTES:/zap/wrk:rw" "$IMAGEN" zap-full-scan.py \
    -t "$PORTAL/" -m 2 -I -r "$rol.html" -J "$rol-alertas.json" -w "$rol.md" \
    -z "-config replacer.full_list(0).description=sesion \
        -config replacer.full_list(0).enabled=true \
        -config replacer.full_list(0).matchtype=REQ_HEADER \
        -config replacer.full_list(0).matchstr=Cookie \
        -config replacer.full_list(0).regex=false \
        -config replacer.full_list(0).replacement=sce_sesion=$token \
        -config replacer.full_list(1).description=cierre-cabecera \
        -config replacer.full_list(1).enabled=true \
        -config replacer.full_list(1).matchtype=REQ_HEADER_STR \
        -config replacer.full_list(1).matchstr=$cierre \
        -config replacer.full_list(1).regex=false \
        -config replacer.full_list(1).replacement=0 \
        -config replacer.full_list(2).description=cierre-cuerpo \
        -config replacer.full_list(2).enabled=true \
        -config replacer.full_list(2).matchtype=REQ_BODY_STR \
        -config replacer.full_list(2).matchstr=$cierre \
        -config replacer.full_list(2).regex=false \
        -config replacer.full_list(2).replacement=0 \
        -config spider.postform=false \
        -config scanner.threadPerHost=2 \
        -config scanner.maxScanDurationInMins=10" > "$REPORTES/$rol.txt" 2>&1 || estado=$?
  [ "$estado" -eq 0 ] || { tail -20 "$REPORTES/$rol.txt"; echo "::error::zap-full-scan ($rol) terminó con código $estado" >&2; exit 1; }
  curl -sf "$API/sesiones/actual" -H "Authorization: Bearer $token" -o /dev/null \
    || { echo "::error::la sesión de $rol se cerró o venció durante el escaneo" >&2; exit 1; }

  docker compose logs --no-log-prefix api | tail -n "+$((antes + 1))" \
    | jq -Rc 'fromjson? | select(.context == "Peticiones") | .message' > "$REPORTES/$rol-api.jsonl"
  sin_manejar="$(docker compose logs --no-log-prefix web | tail -n "+$((antes_web + 1))" | grep -c '⨯ ErrorApi' || true)"
  jq -s --arg u "$usuario" --argjson s "$sin_manejar" '{con_sesion: (map(select(.usuario == $u)) | length),
      errores_5xx: (map(select(.estado >= 500)) | length), portal_sin_manejar: $s}' \
    "$REPORTES/$rol-api.jsonl" > "$REPORTES/$rol-api.json"
  echo "$rol: $(grep -h '^FAIL-NEW:' "$REPORTES/$rol.txt"); API: $(jq -c . "$REPORTES/$rol-api.json")"
  jq -e '.con_sesion > 10' "$REPORTES/$rol-api.json" >/dev/null \
    || { echo "::error::el portal no llamó a la API con la sesión de $rol: ZAP no entró" >&2; exit 1; }
  jq -e '.errores_5xx == 0' "$REPORTES/$rol-api.json" >/dev/null \
    || { echo "::error::una entrada del portal produjo un 5xx en la API ($rol)" >&2; exit 1; }
  jq -e '.portal_sin_manejar == 0' "$REPORTES/$rol-api.json" >/dev/null \
    || { echo "::error::el portal respondió 500 a un rechazo de la API ($rol): ver docker compose logs web" >&2; exit 1; }
done

# Severidad: riskcode 3 = alta. El tratamiento de cada alerta está en docs/calidad/informe-zap.md.
jq -s '[.[].site[].alerts[]] | group_by(.pluginid) | map({pluginid: .[0].pluginid, alerta: .[0].name,
    riesgo: .[0].riskdesc, riskcode: .[0].riskcode, instancias: (map(.count | tonumber) | add)})' \
  "$REPORTES"/*-alertas.json > "$REPORTES/alertas.json"
jq -r '.[] | "\(.riesgo): \(.alerta) [\(.pluginid)] (\(.instancias))"' "$REPORTES/alertas.json" | sort
altas="$(jq '[.[] | select(.riskcode == "3")] | length' "$REPORTES/alertas.json")"
echo "ZAP en el portal: $altas alertas altas"
[ "$altas" -eq 0 ] || { echo "::error::ZAP encontró $altas alertas altas en el portal" >&2; exit 1; }
