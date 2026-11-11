#!/usr/bin/env bash
# CD-DAT con Great Expectations (Tabla 42, AU-22) contra la base de un ambiente ya levantado con docker compose.
# Corre en un contenedor de Python, sin instalar nada en el equipo. Data Docs en HTML en el directorio de reportes.
# Uso: scripts/calidad-datos.sh [dir-de-reportes]
#      Con RED_DATOS (opciones de red de docker run) y URL_DATOS (conexión de SQLAlchemy) valida otra base, como la de
#      staging (scripts/staging.sh). Por omisión, la de docker compose.
set -euo pipefail

REPORTES="${1:-reportes/calidad-datos}"
IMAGEN="python:3.12-slim"
VERSION_GX="1.24.1"

rm -rf "$REPORTES"
mkdir -p "$REPORTES"
chmod a+rwx "$REPORTES"
if [ -z "${RED_DATOS:-}" ]; then
  base="$(docker compose ps -q db)"
  [ -n "$base" ] || { echo "::error::no hay base de datos levantada con docker compose" >&2; exit 1; }
  RED_DATOS="--network container:$base" # la red de la base: el puerto 5432 no se publica fuera de Compose
fi
export URL_DATOS="${URL_DATOS:-postgresql+psycopg2://sce_app:sce_dev@localhost:5432/sce}" # la contraseña no va en ps

# shellcheck disable=SC2086 # RED_DATOS son varias opciones
docker run --rm $RED_DATOS -e URL_DATOS \
  -v "$PWD/scripts/calidad-datos.py:/calidad-datos.py:ro" \
  -v "$PWD/api/prisma/verificacion:/consultas:ro" \
  -v "$PWD/$REPORTES:/salida" \
  "$IMAGEN" sh -c "pip install -q --disable-pip-version-check --root-user-action=ignore \
      "great_expectations[postgresql]==$VERSION_GX" \
    && python /calidad-datos.py \"\$URL_DATOS\" /consultas /salida"
