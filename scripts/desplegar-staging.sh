#!/usr/bin/env bash
# Etapa 8 de la Tabla 53: despliega en staging las imagenes ya firmadas, por digest, con respaldo previo, migraciones
# con registro, pgAudit y datos sinteticos. La llama .github/workflows/staging.yml; scripts/ensayo-staging.sh la ensaya
# en local. Deja el registro del despliegue (31.2) en reportes/staging/despliegue.md.
#
# Variables:
#   EN_APP, EN_DB  orden que ejecuta un comando en el servidor de aplicacion o en el de base: "ssh sce-app" o "sh -c"
#   DIR            directorio del ambiente en el servidor de aplicacion
#   ETIQUETA, IMAGEN_API, IMAGEN_PORTAL, DOMINIO
#   DATABASE_URL, JWT_SECRET, CONTRASENA_SEMILLA  secretos del ambiente (20.2)
#   ENSAYO=1       imagenes locales: no las descarga
set -euo pipefail
: "${EN_APP:?}" "${EN_DB:?}" "${DIR:?}" "${ETIQUETA:?}" "${IMAGEN_API:?}" "${IMAGEN_PORTAL:?}" "${DOMINIO:?}"
: "${DATABASE_URL:?}" "${JWT_SECRET:?}" "${CONTRASENA_SEMILLA:?}"

REPORTES=reportes/staging
mkdir -p "$REPORTES"
app() { $EN_APP "cd '$DIR' && $1"; }
db() { $EN_DB "$1"; }

# 1. Archivos del ambiente, de la misma etiqueta que las imagenes, y .env solo legible por su dueno.
tar -C infra/staging/app -c compose.yml nginx.conf.template | $EN_APP "mkdir -p '$DIR' && tar -x -C '$DIR'"
printf '%s\n' "IMAGEN_API=$IMAGEN_API" "IMAGEN_PORTAL=$IMAGEN_PORTAL" "DOMINIO=$DOMINIO" \
  "DATABASE_URL=$DATABASE_URL" "JWT_SECRET=$JWT_SECRET" "CONTRASENA_SEMILLA=$CONTRASENA_SEMILLA" \
  | app "umask 077 && cat > .env"
app "test -s 'certificados/live/$DOMINIO/fullchain.pem'" \
  || { echo "::error::falta el certificado TLS de $DOMINIO (alta en docs/gobierno/inventario-de-ambientes.md)" >&2; exit 1; }
# El certificado del servidor de base es la CA con que la API lo verifica.
db "docker exec sce-db cat /var/lib/postgresql/tls/servidor.crt" | app "cat > db.crt"

# 2. Respaldo previo: si la etiqueta nueva falla, el rollback vuelve a la anterior con estos datos (20.2).
RESPALDO="antes-de-$ETIQUETA-$(date -u +%Y%m%dT%H%M%SZ).dump"
db "docker exec -u postgres sce-db pg_dump -Fc -d sce -f /respaldos/$RESPALDO"

# 3. Imagenes. 4. pgAudit antes de migrar, para que registre el DDL; migraciones y datos sinteticos; pgAudit otra vez,
# sobre las tablas nuevas. 5. Arranque.
[ "${ENSAYO:-}" = 1 ] || app "docker compose pull --quiet api web"
app "docker compose pull --quiet proxy"
pgaudit() { db "docker exec -i -u postgres sce-db psql -d sce -v ON_ERROR_STOP=1 -q" < db/pgaudit.sql; }
pgaudit
app "docker compose --profile tareas run --rm tareas" 2>&1 | tee "$REPORTES/migraciones.txt"
pgaudit
app "docker compose up -d --wait --wait-timeout 300 api web proxy"

{
  echo "### Despliegue a staging (etapa 8, Tabla 53)"
  echo "- Etiqueta: $ETIQUETA"
  echo "- Commit: $(git rev-parse HEAD)"
  echo "- API: $IMAGEN_API"
  echo "- Portal: $IMAGEN_PORTAL"
  echo "- Dominio: https://$DOMINIO"
  echo "- Respaldo previo: $RESPALDO"
  echo "- Responsable: ${GITHUB_ACTOR:-$(git config user.name)}"
  echo "- Fecha: $(date -u +%FT%TZ)"
  echo "- Migraciones: $(grep -c '^Applying migration' "$REPORTES/migraciones.txt" || true) aplicadas en esta corrida"
} | tee "$REPORTES/despliegue.md"
