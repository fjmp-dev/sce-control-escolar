#!/usr/bin/env bash
# Consultas lentas de PostgreSQL (Tabla 47: pgBadger, "informe de consultas por tiempo acumulado"). Lee el registro de
# sce-db, donde la base escribe las sentencias de mas de 250 ms sin los valores de sus parametros, y genera el informe
# con --anonymize, que reemplaza tambien las literales de las consultas (CS-SEG-08).
# Uso: scripts/pgbadger.sh [dir-de-reportes]   (EN_DB de .staging/ambiente.env si existe, o "sh -c")
set -euo pipefail
REPORTES="${1:-reportes/pgbadger}"
set -a
# shellcheck disable=SC1090
[ -f "${AMBIENTE_ENV:-.staging/ambiente.env}" ] && . "${AMBIENTE_ENV:-.staging/ambiente.env}"
set +a
mkdir -p "$REPORTES" && chmod a+rwx "$REPORTES"
${EN_DB:-sh -c} "docker logs sce-db" > "$REPORTES/postgresql.log" 2>&1
# El prefijo es el de db/pgaudit.sql (log_line_prefix).
docker run --rm -v "$PWD/$REPORTES:/r" debian:bookworm-slim sh -c "
  apt-get update -qq >/dev/null && apt-get install -y -qq --no-install-recommends pgbadger >/dev/null
  pgbadger --anonymize --quiet --prefix '%m [%p] %q%u@%d %a ' -f stderr -o /r/pgbadger.html /r/postgresql.log"
rm -f "$REPORTES/postgresql.log" # lleva sentencias completas; el informe ya las anonimizo
lentas="$(grep -c 'duration: ' <(${EN_DB:-sh -c} "docker logs sce-db" 2>&1) || true)"
echo "pgBadger: $REPORTES/pgbadger.html ($lentas sentencias de mas de 250 ms)"
