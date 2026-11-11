#!/usr/bin/env bash
# Despliega las imagenes por digest, con respaldo previo, migraciones con registro, pgAudit y datos sinteticos (salvo
# SEMILLA=0, en el piloto de ensayo de CC-022). La llama scripts/staging.sh en las etapas 7 y 8 (CC-018); con EN_APP,
# EN_DB y EN_PROXY por SSH sirve tambien para servidores reales. Deja el registro del despliegue (31.2) en
# reportes/staging/despliegue.md. scripts/rollback.sh la vuelve a llamar con la etiqueta anterior.
#
# Variables:
#   EN_APP, EN_DB  orden que ejecuta un comando en el servidor de aplicacion o en el de base: "ssh sce-app" o "sh -c"
#   EN_PROXY       lo mismo en el nodo del proxy (por omision, EN_APP)
#   DIR            directorio del ambiente en el servidor de aplicacion; DIR_PROXY, el del proxy (por omision, DIR/proxy)
#   ETIQUETA, IMAGEN_API, IMAGEN_PORTAL, DOMINIO
#   DATABASE_URL, JWT_SECRET, CONTRASENA_SEMILLA  secretos del ambiente (20.2)
#   AMBIENTE       staging (por omision) o piloto; SEMILLA=0 despliega sin datos
#   IMAGENES_LOCALES=1  imagenes construidas en la corrida: no las descarga
set -euo pipefail
: "${EN_APP:?}" "${EN_DB:?}" "${DIR:?}" "${ETIQUETA:?}" "${IMAGEN_API:?}" "${IMAGEN_PORTAL:?}" "${DOMINIO:?}"
: "${DATABASE_URL:?}" "${JWT_SECRET:?}" "${CONTRASENA_SEMILLA:?}"

EN_PROXY="${EN_PROXY:-$EN_APP}" DIR_PROXY="${DIR_PROXY:-$DIR/proxy}" SEMILLA="${SEMILLA:-1}"
REPORTES=reportes/staging
mkdir -p "$REPORTES"
app() { $EN_APP "cd '$DIR' && $1"; }
proxy() { $EN_PROXY "cd '$DIR_PROXY' && $1"; }
db() { $EN_DB "$1"; }

# 1. Archivos del ambiente, de la misma etiqueta que las imagenes, y .env solo legible por su dueno.
tar -C infra/staging/app -c compose.yml | $EN_APP "mkdir -p '$DIR' && tar -x -C '$DIR'"
tar -C infra/staging/proxy -c compose.yml nginx.conf.template | $EN_PROXY "mkdir -p '$DIR_PROXY' && tar -x -C '$DIR_PROXY'"
printf '%s\n' "IMAGEN_API=$IMAGEN_API" "IMAGEN_PORTAL=$IMAGEN_PORTAL" "DOMINIO=$DOMINIO" \
  "DATABASE_URL=$DATABASE_URL" "JWT_SECRET=$JWT_SECRET" "CONTRASENA_SEMILLA=$CONTRASENA_SEMILLA" "SEMILLA=$SEMILLA" \
  | app "umask 077 && cat > .env"
echo "DOMINIO=$DOMINIO" | proxy "umask 077 && cat > .env"
proxy "test -s 'certificados/live/$DOMINIO/fullchain.pem'" \
  || { echo "::error::falta el certificado TLS de $DOMINIO (alta en docs/gobierno/inventario-de-ambientes.md)" >&2; exit 1; }
# El certificado del servidor de base es la CA con que la API lo verifica.
db "docker exec sce-db cat /var/lib/postgresql/tls/servidor.crt" | app "cat > db.crt"

# 2. Respaldo previo: si la etiqueta nueva falla, el rollback vuelve a la anterior con estos datos (20.2).
RESPALDO="antes-de-$ETIQUETA-$(date -u +%Y%m%dT%H%M%SZ).dump"
db "docker exec -u postgres sce-db pg_dump -Fc -d sce -f /respaldos/$RESPALDO"

# 3. Imagenes. 4. pgAudit antes de migrar, para que registre el DDL; migraciones y datos sinteticos; pgAudit otra vez,
# sobre las tablas nuevas. 5. Arranque.
[ "${IMAGENES_LOCALES:-}" = 1 ] || app "docker compose pull --quiet api web"
proxy "docker compose pull --quiet proxy"
pgaudit() { db "docker exec -i -u postgres sce-db psql -d sce -v ON_ERROR_STOP=1 -q" < db/pgaudit.sql; }
pgaudit
app "docker compose --profile tareas run --rm tareas" 2>&1 | tee "$REPORTES/migraciones.txt"
pgaudit
app "docker compose up -d --wait --wait-timeout 300 api web"
proxy "docker compose up -d --wait --wait-timeout 60 --force-recreate proxy" # vuelve a resolver api y web

{
  echo "### Despliegue a ${AMBIENTE:-staging} (etapa 8, Tabla 53)"
  echo "- Etiqueta: $ETIQUETA"
  echo "- Commit: $(git rev-parse HEAD)"
  echo "- API: $IMAGEN_API"
  echo "- Portal: $IMAGEN_PORTAL"
  echo "- Dominio: https://$DOMINIO"
  echo "- Respaldo previo: $RESPALDO"
  echo "- Responsable: ${GITHUB_ACTOR:-$(git config user.name)}"
  echo "- Fecha: $(date -u +%FT%TZ)"
  echo "- Migraciones: $(grep -c '^Applying migration' "$REPORTES/migraciones.txt" || true) aplicadas en esta corrida"
  echo "- Datos sinteticos: $([ "$SEMILLA" = 0 ] && echo 'no (SEMILLA=0, CC-022)' || echo 'si (RK-09)')"
} | tee "$REPORTES/despliegue.md"
