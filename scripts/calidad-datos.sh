#!/usr/bin/env bash
# CD-DAT con Great Expectations (Tabla 42, AU-22) contra la base de un ambiente ya levantado con docker compose.
# Corre en un contenedor de Python, sin instalar nada en el equipo. Data Docs en HTML en el directorio de reportes.
# Uso: scripts/calidad-datos.sh [dir-de-reportes]
set -euo pipefail

REPORTES="${1:-reportes/calidad-datos}"
IMAGEN="python:3.12-slim"
VERSION_GX="1.24.1"

rm -rf "$REPORTES"
mkdir -p "$REPORTES"
chmod a+rwx "$REPORTES"
base="$(docker compose ps -q db)"
[ -n "$base" ] || { echo "::error::no hay base de datos levantada con docker compose" >&2; exit 1; }

# La red de la base: el puerto 5432 no se publica fuera de Compose.
docker run --rm --network "container:$base" \
  -v "$PWD/scripts/calidad-datos.py:/calidad-datos.py:ro" \
  -v "$PWD/api/prisma/verificacion:/consultas:ro" \
  -v "$PWD/$REPORTES:/salida" \
  "$IMAGEN" sh -c "pip install -q --disable-pip-version-check --root-user-action=ignore \
      "great_expectations[postgresql]==$VERSION_GX" \
    && python /calidad-datos.py postgresql+psycopg2://sce_app:sce_dev@localhost:5432/sce /consultas /salida"
