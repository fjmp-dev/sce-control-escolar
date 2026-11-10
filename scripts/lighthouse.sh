#!/usr/bin/env bash
# Lighthouse (Tabla 42 y 28.2): puntaje de accesibilidad y rendimiento percibido, contra un ambiente ya levantado.
# Criterio del equipo, porque el manual no fija cifra: accesibilidad >= 90. Rendimiento y peso quedan como reporte.
# Falla si Lighthouse no llego a medir la pagina autenticada. Requiere Chrome en el equipo (CHROME_PATH si no lo halla).
# Uso: scripts/lighthouse.sh [dir-de-reportes]
set -euo pipefail

REPORTES="${1:-reportes/lighthouse}"
PORTAL="http://localhost:3000"
API="http://localhost:3001"
VERSION="13.6.0"
UMBRAL=90
mkdir -p "$REPORTES"

token() {
  curl -sf -X POST "$API/sesiones" -H 'Content-Type: application/json' \
    -d "{\"correo\":\"$1\",\"contrasena\":\"sce-dev-2026\"}" | jq -er .token
}

medir() { # nombre ruta [token]
  local cabeceras='{}'
  [ -n "${3:-}" ] && cabeceras="{\"Cookie\":\"sce_sesion=$3\"}"
  npx --yes "lighthouse@$VERSION" "$PORTAL$2" --quiet --output=json --output=html \
    --output-path="$REPORTES/$1" --only-categories=accessibility,performance,best-practices \
    --extra-headers="$cabeceras" --chrome-flags="--headless=new --no-sandbox --disable-gpu" >/dev/null 2>&1
  jq -e --arg ruta "$2" '(.finalDisplayedUrl | endswith($ruta)) and (.categories.accessibility.score != null)' \
    "$REPORTES/$1.report.json" >/dev/null || { echo "::error::Lighthouse no midio $2" >&2; exit 1; }
}

medir ingresar /ingresar
ADMIN="$(token administrador@sce.test)"
COORDINACION="$(token coordinacion@sce.test)"
ALUMNO="$(token alumno@sce.test)"
CONTROL="$(token control.escolar@sce.test)"
medir control-escolar-expediente /expedientes/2420003 "$CONTROL"
medir administrador-usuarios /usuarios "$ADMIN"
medir coordinacion-materias /materias "$COORDINACION"
medir coordinacion-oferta /oferta "$COORDINACION"
medir alumno-inicio / "$ALUMNO"
medir alumno-inscripcion /inscripcion "$ALUMNO"

echo '| Pagina | Accesibilidad | Rendimiento | Buenas practicas | Peso total (KB) |' | tee "$REPORTES/resumen.md"
echo '|---|---|---|---|---|' | tee -a "$REPORTES/resumen.md"
falla=0
for reporte in "$REPORTES"/*.report.json; do
  jq -r --arg n "$(basename "$reporte" .report.json)" \
    '"| \($n) | \(.categories.accessibility.score * 100 | round) | \(.categories.performance.score * 100 | round) | \(.categories["best-practices"].score * 100 | round) | \(.audits["total-byte-weight"].numericValue / 1024 | round) |"' \
    "$reporte" | tee -a "$REPORTES/resumen.md"
  jq -e --argjson u "$UMBRAL" '.categories.accessibility.score * 100 >= $u' "$reporte" >/dev/null || falla=1
done
[ "$falla" -eq 0 ] || { echo "::error::accesibilidad por debajo de $UMBRAL" >&2; exit 1; }
