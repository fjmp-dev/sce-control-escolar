#!/usr/bin/env bash
# Ensayo de staging sin servidores: dos "servidores" en una red de Docker con direcciones fijas, como la red privada de
# la Fig. 9, con el mismo despliegue y el mismo humo que la etapa 8 y un certificado autofirmado. Ademas prueba lo que la
# base debe rechazar: otra direccion, conexion sin TLS, TLS 1.1 y el superusuario por red (Tabla 38, CC-005).
# Uso: scripts/ensayo-staging.sh [imagen-api] [imagen-portal]   (por omision, las de docker compose build)
#      CONSERVAR=1 deja el ambiente arriba al terminar.
set -euo pipefail

IMAGEN_API="${1:-sce-api:local}"
IMAGEN_PORTAL="${2:-sce-portal:local}"
RED=sce-ensayo
SUBRED=172.30.250
DB_IP=$SUBRED.10
BASE="$PWD/.ensayo-staging" # bajo $HOME, que es lo que Colima monta; fuera de reportes/, que CI publica
CLAVE_APP="ensayo-$(openssl rand -hex 12)"
CONTRASENA_SEMILLA="ensayo-$(openssl rand -hex 12)"
export CONTRASENA_SEMILLA

falla() { echo "::error::$1" >&2; exit 1; }
db_compose() { (cd "$BASE/db" && docker compose "$@"); }
app_compose() { (cd "$BASE/app" && COMPOSE_FILE=compose.yml:ensayo.yml docker compose "$@"); }
limpiar() {
  [ "${CONSERVAR:-}" = 1 ] && return
  app_compose --profile tareas down -v --remove-orphans >/dev/null 2>&1 || true
  db_compose down -v >/dev/null 2>&1 || true
  docker network rm "$RED" >/dev/null 2>&1 || true
}
trap 'estado=$?; [ $estado -eq 0 ] || { app_compose logs --tail 80 2>/dev/null; db_compose logs --tail 80 2>/dev/null; }; limpiar' EXIT

limpiar
rm -rf "$BASE" && mkdir -p "$BASE/db" "$BASE/app/certificados/live/localhost" "$BASE/app/acme"
docker network create --subnet "$SUBRED.0/24" "$RED" >/dev/null

# Servidor de base: solo el rango .16 a .31 es "el servidor de aplicacion".
cp infra/staging/db/* "$BASE/db/"
cat > "$BASE/db/ensayo.yml" <<EOF
services:
  db:
    ports: !reset []
    networks: { ensayo: { ipv4_address: $DB_IP } }
networks: { ensayo: { external: true, name: $RED } }
EOF
printf '%s\n' "COMPOSE_FILE=compose.yml:ensayo.yml" "POSTGRES_PASSWORD=$(openssl rand -hex 16)" \
  "SCE_APP_PASSWORD=$CLAVE_APP" "RED_APP=$SUBRED.16/28" "NOMBRE_DB=$DB_IP" "ESCUCHA=127.0.0.1" > "$BASE/db/.env"
db_compose up -d --build --wait --wait-timeout 120

# Servidor de aplicacion: certificado autofirmado para localhost, y la API y las tareas dentro del rango permitido.
openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj /CN=localhost -addext subjectAltName=DNS:localhost \
  -keyout "$BASE/app/certificados/live/localhost/privkey.pem" \
  -out "$BASE/app/certificados/live/localhost/fullchain.pem" 2>/dev/null
cat > "$BASE/app/ensayo.yml" <<EOF
services:
  api:
    networks: { default: {}, ensayo: { ipv4_address: $SUBRED.20 } }
  tareas:
    networks: { default: {}, ensayo: { ipv4_address: $SUBRED.21 } }
networks: { ensayo: { external: true, name: $RED } }
EOF

export EN_DB="sh -c" EN_APP="env COMPOSE_FILE=compose.yml:ensayo.yml sh -c" DIR="$BASE/app" ENSAYO=1
JWT_SECRET="ensayo-$(openssl rand -hex 24)"
export ETIQUETA=v0.0.0-ensayo DOMINIO=localhost IMAGEN_API IMAGEN_PORTAL JWT_SECRET
export DATABASE_URL="postgresql://sce_app:$CLAVE_APP@$DB_IP:5432/sce?schema=public&sslmode=require&sslcert=/certs/db.crt&sslaccept=strict"
scripts/desplegar-staging.sh

# Lo que la base debe rechazar, y la verificacion completa del certificado desde el rango permitido.
docker exec sce-db cat /var/lib/postgresql/tls/servidor.crt > "$BASE/db.crt"
psql_desde() { # ip conexion; imprime la respuesta, tambien el rechazo (por eso no propaga el codigo de psql)
  docker run --rm --network "$RED" --ip "$1" -v "$BASE/db.crt:/ca.crt:ro" postgres:16 \
    psql "$2" -Atc 'SELECT 1' 2>&1 || true
}
URL_APP="postgresql://sce_app:$CLAVE_APP@$DB_IP:5432/sce"
psql_desde "$SUBRED.22" "$URL_APP?sslmode=verify-full&sslrootcert=/ca.crt" | grep -qx 1 \
  || falla "el servidor de aplicacion no entra con TLS verificado"
psql_desde "$SUBRED.100" "$URL_APP?sslmode=require" | grep -q 'no pg_hba.conf entry' \
  || falla "la base acepto una direccion fuera del servidor de aplicacion"
psql_desde "$SUBRED.22" "$URL_APP?sslmode=disable" | grep -q 'no encryption' \
  || falla "la base acepto una conexion sin TLS"
psql_desde "$SUBRED.22" "$URL_APP?sslmode=require&ssl_max_protocol_version=TLSv1.1" | grep -qiE 'protocol|version' \
  || falla "la base acepto TLS 1.1"
psql_desde "$SUBRED.22" "postgresql://postgres:x@$DB_IP:5432/sce?sslmode=require" | grep -q 'no pg_hba.conf entry' \
  || falla "la base acepto al superusuario por red"
echo "base: rechaza otra direccion, sin TLS, TLS 1.1 y superusuario por red; acepta TLS verificado" \
  | tee "$BASE/rechazos.txt"

# pgAudit registro el DDL de las migraciones de esta corrida.
db_compose logs --no-log-prefix db > "$BASE/registro-db.txt"
grep -q 'sce_app@sce .*AUDIT: SESSION,.*,DDL,' "$BASE/registro-db.txt" || falla "pgAudit no registro el DDL de las migraciones"
echo "pgAudit: DDL registrado" | tee -a "$BASE/rechazos.txt"

CURL_CA_BUNDLE="$BASE/app/certificados/live/localhost/fullchain.pem" NEWMAN_OPCIONES=--insecure \
  scripts/verificar-staging.sh https://localhost
echo "Ensayo de staging: ok"
