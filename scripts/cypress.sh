#!/usr/bin/env bash
# Extremo a extremo (Tabla 42, Cypress: video y capturas por caso) y axe (28.2), contra un ambiente ya levantado
# (docker compose up). Falla si Cypress no llego a ejecutar pruebas o si axe no evaluo paginas.
# Uso: scripts/cypress.sh [dir-de-reportes] [argumentos de cypress run]
set -euo pipefail

REPORTES="${1:-reportes/cypress}"
shift || true
IMAGEN="cypress/included:16.2.1"

rm -rf web/cypress/videos web/cypress/screenshots web/cypress/reportes
mkdir -p "$REPORTES" web/cypress/reportes
chmod -R a+rwx web/cypress

estado=0
docker run --rm --network host -v "$PWD/web:/e2e" -w /e2e "$IMAGEN" \
  --reporter junit --reporter-options "mochaFile=cypress/reportes/junit/[hash].xml,toConsole=false" "$@" \
  > "$REPORTES/salida.txt" 2>&1 || estado=$?

for carpeta in videos screenshots reportes; do
  [ -d "web/cypress/$carpeta" ] && cp -R "web/cypress/$carpeta" "$REPORTES/"
done
[ "$estado" -eq 0 ] || { tail -60 "$REPORTES/salida.txt"; echo "::error::Cypress termino con codigo $estado" >&2; exit 1; }

# Falla cerrada: una corrida sin pruebas tambien sale con codigo 0.
suma() { grep -h '<testsuites' "$REPORTES"/reportes/junit/*.xml | sed -E "s/.* $1=\"([0-9]+)\".*/\1/" | paste -sd+ - | bc; }
pruebas="$(suma tests)"
fallos="$(suma failures)"
[ "${pruebas:-0}" -gt 0 ] && [ "${fallos:-1}" -eq 0 ] || { echo "::error::Cypress: $pruebas pruebas, $fallos fallos" >&2; exit 1; }
echo "Cypress: $pruebas pruebas, $fallos fallos"
if [ $# -eq 0 ]; then
  paginas="$(find "$REPORTES/reportes/axe" -name '*.json' | wc -l | tr -d ' ')"
  [ "$paginas" -gt 10 ] || { echo "::error::axe solo evaluo $paginas paginas" >&2; exit 1; }
  echo "axe: $paginas paginas, $(jq -s 'map(.incumplimientos | length) | add' "$REPORTES"/reportes/axe/*.json) incumplimientos"
fi
