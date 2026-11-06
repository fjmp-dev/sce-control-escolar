#!/usr/bin/env bash
# CS-SEG-08 y AU-13: Gitleaks sobre el historial completo, no solo sobre el diff.
# Falla cerrada: si git rechaza el repositorio montado, Gitleaks informa "no leaks found" con 0 commits y sale con 0.
#
# Uso: scripts/gitleaks-historial.sh [archivo-de-reporte]
set -euo pipefail

reporte=${1:-gitleaks.json}
imagen=ghcr.io/gitleaks/gitleaks:v8.30.1

if [ "$(git rev-parse --is-shallow-repository)" = true ]; then
  echo "::error::Clon parcial: el resultado no cubriria el historial completo."
  exit 1
fi

salida=$(docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/repo" -w /repo \
  -e GIT_CONFIG_COUNT=1 -e GIT_CONFIG_KEY_0=safe.directory -e GIT_CONFIG_VALUE_0=/repo \
  "$imagen" git /repo --log-opts=--all --no-color --redact --report-format json --report-path "/repo/$reporte" 2>&1) && codigo=0 || codigo=$?
echo "$salida"

escaneados=$(sed -n 's/.* \([0-9][0-9]*\) commits scanned.*/\1/p' <<<"$salida" | tail -1)
if [ "${escaneados:-0}" -eq 0 ]; then
  echo "::error::Gitleaks no escaneo ningun commit: el resultado no es valido."
  exit 1
fi
# No coincide con rev-list: Gitleaks no cuenta merges ni commits sin texto nuevo, como los de solo imagenes.
echo "Commits escaneados: $escaneados. Coincidencias: $(jq length "$reporte")."
exit "$codigo"
