#!/usr/bin/env bash
# Registro de una corrida de rendimiento (sec. 24.2 y Tabla 48): herramienta, perfil, fecha, etiqueta y percentiles, con
# el dimensionamiento y las imagenes. Junta los datos de la corrida con <dir>/metas.md (metas.sh) en <dir>/registro.md,
# y en el resumen del job si corre en Actions. Es la fila que se copia a docs/calidad/informe-rendimiento.md.
# Uso: CASO HERRAMIENTA PERFIL ETIQUETA INICIO FIN DIMENSIONAMIENTO [IMAGEN_API IMAGEN_PORTAL] infra/rendimiento/registro.sh <dir>
set -euo pipefail
DIR="${1:?dir de la corrida}"
fecha() { date -u -d "@$1" +%FT%TZ 2>/dev/null || date -u -r "$1" +%FT%TZ; }
{
  echo "## ${CASO:?} — ${ETIQUETA:?}"
  echo
  echo "| Campo | Valor |"
  echo "|---|---|"
  echo "| Herramienta | ${HERRAMIENTA:?} |"
  echo "| Perfil | ${PERFIL:?} |"
  echo "| Inicio y fin (UTC) | $(fecha "${INICIO:?}") a $(fecha "${FIN:?}") ($(((FIN - INICIO) / 60)) min) |"
  echo "| Etiqueta y commit | \`$ETIQUETA\`, \`$(git rev-parse --short=12 HEAD)\` |"
  echo "| Imagenes | \`${IMAGEN_API:-local}\`, \`${IMAGEN_PORTAL:-local}\` |"
  echo "| Ambiente | Staging efimero con la topologia de la Fig. 9 (scripts/staging.sh), pasarela simulada (CC-020) |"
  echo "| Dimensionamiento | ${DIMENSIONAMIENTO:?} |"
  echo "| Corrida | ${GITHUB_SERVER_URL:-}/${GITHUB_REPOSITORY:-local}/actions/runs/${GITHUB_RUN_ID:-local} |"
  echo
  cat "$DIR/metas.md"
} | tee "$DIR/registro.md" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
