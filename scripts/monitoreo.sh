#!/usr/bin/env bash
# Monitoreo (sec. 35, Tabla 57) junto al ambiente que dejo scripts/staging.sh con CONSERVAR=1: infra/monitoreo en la red
# privada, con la CA del proxy y el rol sce_monitor de .staging/ambiente.env. Lo usan rendimiento.yml y los ensayos de
# CO-FIA-01. Grafana en http://127.0.0.1:3300 (admin y la contrasena de .staging/grafana), Prometheus en :9090 y el
# correo de las alertas en :8025.
# Uso: scripts/monitoreo.sh arriba | abajo | consulta '<promql>' | alertas | correos | salud [segundos] [paso]
set -euo pipefail
set -a
# shellcheck disable=SC1090
. "${AMBIENTE_ENV:-.staging/ambiente.env}"
set +a
: "${RED:?}" "${URL_MONITOR:?}" "${IP_MONITOR:?}" "${CURL_CA_BUNDLE:?}"
[ -s .staging/grafana ] || (umask 077 && openssl rand -hex 16 > .staging/grafana)
export CA_MONITOREO="$CURL_CA_BUNDLE" GRAFANA_CONTRASENA="$(cat .staging/grafana)"
PROM=http://127.0.0.1:9090
mon() { docker compose -p sce-monitoreo -f infra/monitoreo/compose.yml "$@"; }
falla() { echo "::error::$1" >&2; exit 1; }

case "${1:-arriba}" in
  arriba)
    mon up -d --wait --wait-timeout 120 >/dev/null
    for _ in $(seq 40); do # todos los destinos arriba, o falla con los que no
      abajo="$(curl -sf "$PROM/api/v1/targets" | jq -r '.data.activeTargets[] | select(.health != "up") | "\(.labels.job) \(.labels.instance) \(.lastError)"')" || abajo=sin-respuesta
      [ -z "$abajo" ] && break
      sleep 3
    done
    [ -z "$abajo" ] || falla "destinos de Prometheus sin datos: $abajo"
    curl -sf "$PROM/api/v1/targets" | jq -r '.data.activeTargets[] | "monitoreo: \(.labels.job) \(.labels.instance) \(.health)"' ;;
  abajo) mon down -v ;;
  consulta)
    curl -sf --data-urlencode "query=${2:?consulta PromQL}" "$PROM/api/v1/query" \
      | jq -r '.data.result[] | "\(.metric | del(.__name__) | to_entries | map("\(.key)=\(.value)") | join(",")) \(.value[1])"' ;;
  alertas) curl -sf http://127.0.0.1:9093/api/v2/alerts | jq -r '.[] | "\(.status.state) \(.labels.alertname) \(.annotations.resumen)"' ;;
  salud) # muestras de scripts/disponibilidad.py (CO-FIA-01): ok = 1 si la API y la web respondieron. Prometheus da hasta
    # 11 000 puntos por consulta: un mes cabe con paso de 300 s.
    fin="$(date -u +%s)"
    echo fecha,ok
    curl -sf --data-urlencode 'query=min(probe_success{job="salud"})' -d "start=$((fin - ${2:-86400}))" -d "end=$fin" \
      -d "step=${3:-60}" "$PROM/api/v1/query_range" | jq -r '.data.result[0].values[] | "\(.[0] | todate),\(.[1])"' ;;
  correos) curl -sf http://127.0.0.1:8025/api/v1/messages | jq -r '.messages[] | "\(.Created) \(.To | map(.Address) | join(",")) \(.Subject)"' ;;
  *) falla "uso: scripts/monitoreo.sh arriba | abajo | consulta '<promql>' | alertas | correos | salud [segundos] [paso]" ;;
esac
