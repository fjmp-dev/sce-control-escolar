#!/usr/bin/env bash
# CO-COM-01: matriz de compatibilidad de la Tabla 50 con Playwright (web/playwright.config.ts), contra un ambiente ya
# levantado. Deja el reporte HTML, el JUnit y las trazas de los fallos en el directorio de reportes. Los navegadores se
# instalan antes con `npx playwright install`; la matriz en Markdown la arma scripts/matriz-compatibilidad.sh.
# Uso: [CONTRASENA_SEMILLA=...] scripts/playwright.sh <url-del-portal> [dir-de-reportes] [argumentos de playwright test]
#      p. ej. scripts/playwright.sh http://localhost:3000 reportes/playwright --project='must-*'
set -euo pipefail

URL="${1:?url del portal, p. ej. http://localhost:3000}"
REPORTES="${2:-reportes/playwright}"
shift
[ $# -eq 0 ] || shift

rm -rf "$REPORTES" && mkdir -p "$REPORTES"
REPORTES="$(cd "$REPORTES" && pwd)"
cd web
# Playwright sale con error si no encontró pruebas: no hace falta otra falla cerrada.
URL_BASE="$URL" REPORTES_PLAYWRIGHT="$REPORTES" npx playwright test "$@"
