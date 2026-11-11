#!/usr/bin/env bash
# Lighthouse (Tabla 42 y 28.2; CO-ACC-01, 12.4): accesibilidad y rendimiento percibido, contra un ambiente ya levantado.
# Criterios del equipo, porque el manual no fija cifra: accesibilidad >= 90, que bloquea, y rendimiento >= 90, que solo
# se reporta (columna "Rend. >= 90" y un aviso), igual que FCP, LCP, TBT, CLS y peso.
# Falla si Lighthouse no llegó a medir una página autenticada. Requiere Chrome en el equipo (CHROME_PATH si no lo halla).
# Crea datos propios de la corrida con la API: un cargo de 2026A para 2420001 (alumno@sce.test), su pago pendiente
# (pasarela) y su aprobación (recibo). La cuenta de alumno.dos, que paga Cypress, no se toca.
# Uso: [PORTAL=http://localhost:3000] [API=http://localhost:3001] [CONTRASENA_SEMILLA=...] scripts/lighthouse.sh [dir-de-reportes]
#      rendimiento.yml lo corre contra staging (https://localhost, certificado autofirmado) durante la meseta de
#      CR-REN-01 para medir el rendimiento percibido con carga.
set -euo pipefail

REPORTES="${1:-reportes/lighthouse}"
PORTAL="${PORTAL:-http://localhost:3000}"
API="${API:-http://localhost:3001}"
VERSION="13.6.0"
UMBRAL=90
UMBRAL_RENDIMIENTO=90
mkdir -p "$REPORTES"

token() {
  curl -sf -X POST "$API/sesiones" -H 'Content-Type: application/json' \
    -d "{\"correo\":\"$1\",\"contrasena\":\"${CONTRASENA_SEMILLA:-sce-dev-2026}\"}" | jq -er .token
}

api() { # token método ruta [cuerpo-json]
  local args=(-sf -X "$2" "$API$3" -H "Authorization: Bearer $1")
  [ -n "${4:-}" ] && args+=(-H 'Content-Type: application/json' -d "$4")
  curl "${args[@]}"
}

medir() { # nombre ruta [token]
  local cabeceras='{}'
  [ -n "${3:-}" ] && cabeceras="{\"Cookie\":\"sce_sesion=$3\"}"
  npx --yes "lighthouse@$VERSION" "$PORTAL$2" --quiet --output=json --output=html \
    --output-path="$REPORTES/$1" --only-categories=accessibility,performance,best-practices \
    --extra-headers="$cabeceras" --chrome-flags="--headless=new --no-sandbox --disable-gpu --ignore-certificate-errors" >/dev/null 2>&1
  jq -e --arg ruta "$2" '(.finalDisplayedUrl | endswith($ruta)) and (.categories.accessibility.score != null)' \
    "$REPORTES/$1.report.json" >/dev/null || { echo "::error::Lighthouse no midió $2" >&2; exit 1; }
}

medir ingresar /ingresar
ALUMNO="$(token alumno@sce.test)"
PROFESOR="$(token profesor@sce.test)"
CONTROL="$(token control.escolar@sce.test)"
COORDINACION="$(token coordinacion@sce.test)"
CAJA="$(token caja@sce.test)"
DIRECCION="$(token direccion@sce.test)"
ADMIN="$(token administrador@sce.test)"

# Inicio de los siete roles.
medir alumno-inicio / "$ALUMNO"
medir profesor-inicio / "$PROFESOR"
medir control-escolar-inicio / "$CONTROL"
medir coordinacion-inicio / "$COORDINACION"
medir caja-inicio / "$CAJA"
medir direccion-inicio / "$DIRECCION"
medir administrador-inicio / "$ADMIN"

medir control-escolar-expediente /expedientes/2420003 "$CONTROL"
medir administrador-usuarios /usuarios "$ADMIN"
medir coordinacion-materias /materias "$COORDINACION"
medir coordinacion-oferta /oferta "$COORDINACION"
medir alumno-inscripcion /inscripcion "$ALUMNO"
medir alumno-calificaciones /mis-calificaciones "$ALUMNO"
medir alumno-mi-horario /mi-horario "$ALUMNO"
medir alumno-mi-expediente /mi-expediente "$ALUMNO"
medir alumno-mis-tramites /mis-tramites "$ALUMNO"
medir caja-corte /caja "$CAJA"

# Pago de la corrida: cargo, mi cuenta con adeudo, pasarela con el pago pendiente y recibo del pago aprobado.
api "$CAJA" POST /periodos/2026A/cargos "{\"concepto\":\"Lighthouse $(date +%s)\",\"importe\":10}" >/dev/null
SALDO="$(api "$ALUMNO" GET /alumnos/actual/cuenta | jq -er '.saldo | select(. > 0)')"
PAGO="$(api "$ALUMNO" POST /pagos "{\"importe\":$SALDO}" | jq -er .id)"
medir alumno-mi-cuenta /mi-cuenta "$ALUMNO"
medir alumno-pasarela "/mi-cuenta/pagos/$PAGO" "$ALUMNO"
api "$ALUMNO" POST "/pagos/$PAGO/simulacion" '{"resultado":"aprobado"}' | jq -e '.estado == "aplicado"' >/dev/null
medir alumno-recibo "/mi-cuenta/pagos/$PAGO" "$ALUMNO"

{
  echo '| Página | Accesibilidad | Rendimiento | Rend. >= 90 | Buenas prácticas | FCP (s) | LCP (s) | TBT (ms) | CLS | Peso (KB) |'
  echo '|---|---|---|---|---|---|---|---|---|---|'
} | tee "$REPORTES/resumen.md"
falla=0
lentas=0
for reporte in "$REPORTES"/*.report.json; do
  jq -r --arg n "$(basename "$reporte" .report.json)" --argjson r "$UMBRAL_RENDIMIENTO" '
    def pct: . * 100 | round;
    def seg($a): .audits[$a].numericValue / 100 | round / 10;
    "| \($n) | \(.categories.accessibility.score | pct) | \(.categories.performance.score | pct)"
    + " | \(if (.categories.performance.score | pct) >= $r then "Sí" else "No" end)"
    + " | \(.categories["best-practices"].score | pct) | \(seg("first-contentful-paint"))"
    + " | \(seg("largest-contentful-paint")) | \(.audits["total-blocking-time"].numericValue | round)"
    + " | \(.audits["cumulative-layout-shift"].numericValue * 1000 | round / 1000)"
    + " | \(.audits["total-byte-weight"].numericValue / 1024 | round) |"' \
    "$reporte" | tee -a "$REPORTES/resumen.md"
  jq -e --argjson u "$UMBRAL" '.categories.accessibility.score * 100 >= $u' "$reporte" >/dev/null || falla=1
  jq -e --argjson u "$UMBRAL_RENDIMIENTO" '.categories.performance.score * 100 >= $u' "$reporte" >/dev/null ||
    lentas=$((lentas + 1))
done
[ "$lentas" -eq 0 ] ||
  echo "::warning::$lentas páginas con rendimiento por debajo de $UMBRAL_RENDIMIENTO (criterio del equipo, no bloquea)"
[ "$falla" -eq 0 ] || { echo "::error::accesibilidad por debajo de $UMBRAL" >&2; exit 1; }
