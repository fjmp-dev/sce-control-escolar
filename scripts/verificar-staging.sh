#!/usr/bin/env bash
# Humo en staging (Anexo D, puerta 2 de la sec. 20.1) sobre un despliegue ya hecho: salud e inicio de sesion por rol,
# contratos de API con la inscripcion (Newman), TLS 1.2+ (Tabla 38), cabeceras y ZAP pasivo sobre HTTPS, ausencia de
# datos reales (18.2, RK-09), base solo por TLS con SCRAM y pgAudit activo (CC-005), y revision de accesos.
# El escaneo activo de ZAP corre en la etapa 5 sobre el mismo digest; aqui se mide lo que solo existe en staging.
# Uso: scripts/verificar-staging.sh https://dominio   (EN_DB y CONTRASENA_SEMILLA como en desplegar-staging.sh)
set -euo pipefail
URL="${1:?url de staging}"
: "${EN_DB:?}" "${CONTRASENA_SEMILLA:?}"
REPORTES=reportes/staging
mkdir -p "$REPORTES"
export CONTRASENA_SEMILLA
falla() { echo "::error::$1" >&2; exit 1; }
sql() { $EN_DB "docker exec -i -u postgres sce-db psql -d sce -v ON_ERROR_STOP=1 -At"; } # consulta por stdin

# Salud, inicio de sesion por rol y contratos, a traves del proxy.
scripts/humo.sh "$URL/api" "$URL" | tee "$REPORTES/humo.txt"
scripts/newman.sh "$URL/api" "$REPORTES/newman" | tee -a "$REPORTES/humo.txt"

# HTTP redirige a HTTPS y HTTPS lleva HSTS.
[ "$(curl -s -o /dev/null -w '%{http_code}' "http://${URL#https://}/")" = 301 ] || falla "HTTP no redirige a HTTPS"
curl -sfI "$URL/" | grep -qi '^strict-transport-security: max-age=' || falla "falta HSTS"
echo "HTTP a HTTPS y HSTS: ok" | tee -a "$REPORTES/humo.txt"

# TLS 1.2 o superior (Tabla 38): ningun protocolo anterior se ofrece.
# testssl corre con un usuario sin privilegios: su directorio debe admitir escritura.
mkdir -p "$REPORTES/tls" && chmod a+rwx "$REPORTES/tls"
docker run --rm --network host -v "$PWD/$REPORTES/tls:/reportes" ghcr.io/testssl/testssl.sh:3.2 \
  --quiet --protocols --overwrite --jsonfile /reportes/tls.json "${URL#https://}" > "$REPORTES/tls/tls.txt" || true
[ -s "$REPORTES/tls/tls.json" ] || falla "testssl no llego a medir"
jq -e '[.[] | select(.id | test("^(SSLv2|SSLv3|TLS1|TLS1_1)$")) | .finding | test("^not offered")] | length == 4 and all' \
  "$REPORTES/tls/tls.json" >/dev/null || falla "el servidor ofrece un protocolo anterior a TLS 1.2"
jq -e '[.[] | select(.id | test("^TLS1_[23]$")) | .finding | test("^offered")] | any' "$REPORTES/tls/tls.json" >/dev/null \
  || falla "el servidor no ofrece TLS 1.2 ni 1.3"
jq -r '.[] | select(.id | test("^(SSLv|TLS)")) | "\(.id): \(.finding)"' "$REPORTES/tls/tls.json" | tee -a "$REPORTES/humo.txt"

# ZAP pasivo sobre el portal en HTTPS: cookies Secure, HSTS y demas cabeceras. Criterio: cero altas (Tabla 51).
mkdir -p "$REPORTES/zap" && chmod a+rwx "$REPORTES/zap"
docker run --rm --network host -v "$PWD/$REPORTES/zap:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:2.17.0 \
  zap-baseline.py -t "$URL" -I -r zap.html -J zap.json > "$REPORTES/zap/zap.txt" || true
[ -s "$REPORTES/zap/zap.json" ] || falla "ZAP no llego a medir"
altas="$(jq '[.site[].alerts[] | select(.riskcode == "3")] | length' "$REPORTES/zap/zap.json")"
echo "ZAP pasivo: $altas alertas altas" | tee -a "$REPORTES/humo.txt"
[ "$altas" -eq 0 ] || falla "ZAP encontro alertas altas"

# Datos: ninguno real (18.2, RK-09), y la revision de accesos al registro (sec. 18).
sql < api/prisma/verificacion/sin-datos-reales.sql > "$REPORTES/sin-datos-reales.txt"
[ ! -s "$REPORTES/sin-datos-reales.txt" ] || falla "hay datos que no son sinteticos: $REPORTES/sin-datos-reales.txt"
echo "sin datos reales: ok" | tee -a "$REPORTES/humo.txt"
{ echo "rol|activas|inactivas"; sql < api/prisma/verificacion/accesos.sql; } | tee "$REPORTES/accesos.txt"

# CO-FLE-01 (RNF-FLE-001): la carpeta de Newman dio de alta una segunda facultad solo con datos; aquí se comprueba en
# la base que su cadena quedó completa (plan, materia, grupo, alumno e inscripción), sin migración de por medio.
sql < api/prisma/verificacion/co-fle-01.sql | tee "$REPORTES/co-fle-01.txt"
[ -s "$REPORTES/co-fle-01.txt" ] || falla "CO-FLE-01: no se dio de alta la segunda facultad"
! grep -q '|f$' "$REPORTES/co-fle-01.txt" || falla "CO-FLE-01: hay una facultad incompleta"
echo "CO-FLE-01 segunda facultad sin migración: ok" | tee -a "$REPORTES/humo.txt"

# Base: SCRAM en todo rol con contrasena, conexiones de la aplicacion solo con TLS y pgAudit cargado (CC-005).
sql > "$REPORTES/base.txt" <<'SQL'
SELECT 'sin_scram=' || count(*) FROM pg_authid WHERE rolpassword IS NOT NULL AND rolpassword NOT LIKE 'SCRAM-SHA-256$%';
SELECT 'sin_tls=' || count(*) FROM pg_stat_ssl s JOIN pg_stat_activity a USING (pid) WHERE a.usename = 'sce_app' AND NOT s.ssl;
SELECT 'con_tls=' || count(*) FROM pg_stat_ssl s JOIN pg_stat_activity a USING (pid) WHERE a.usename = 'sce_app' AND s.ssl;
SELECT 'pgaudit=' || count(*) FROM pg_extension WHERE extname = 'pgaudit';
SELECT 'pgaudit_log=' || current_setting('pgaudit.log');
SQL
cat "$REPORTES/base.txt"
grep -qx 'sin_scram=0' "$REPORTES/base.txt" || falla "hay contrasenas sin SCRAM"
grep -qx 'sin_tls=0' "$REPORTES/base.txt" || falla "la aplicacion tiene conexiones sin TLS"
grep -qE '^con_tls=[1-9]' "$REPORTES/base.txt" || falla "la aplicacion no tiene conexiones: no se pudo comprobar TLS"
grep -qx 'pgaudit=1' "$REPORTES/base.txt" || falla "pgAudit no esta activo"
echo "base con SCRAM, TLS y pgAudit: ok" | tee -a "$REPORTES/humo.txt"
