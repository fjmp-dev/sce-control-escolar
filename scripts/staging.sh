#!/usr/bin/env bash
# Staging efimero (Tabla 30, CC-018): dos "servidores" en una red de Docker con direcciones fijas, como la red privada de
# la Fig. 9, con certificado autofirmado y secretos generados en cada corrida, que no se guardan en ningun lado (20.2).
# Despliega, corre el humo del Anexo D y prueba lo que la base debe rechazar: otra direccion, conexion sin TLS, TLS 1.1
# y el superusuario por red (Tabla 38, CC-005). Termina con la calidad de datos (scripts/calidad-datos.sh) y se destruye.
# - Etapa 7: en cada pull request e integracion, con las imagenes de la corrida.
# - Etapa 8 (.github/workflows/staging.yml): con las imagenes firmadas de una etiqueta SemVer, por digest.
# - Piloto de ensayo (CC-022): AMBIENTE=piloto, con los secretos y la CA del environment "piloto" de GitHub y sin datos
#   (SEMILLA=0); en lugar del humo con usuarios comprueba que no hay usuarios ni datos.
# - Rollback ensayado (20.2): con ETIQUETA_ANTERIOR, ANTERIOR_API y ANTERIOR_PORTAL despliega primero la etiqueta
#   anterior, luego la nueva, vuelve a la anterior con scripts/rollback.sh y despliega otra vez la nueva.
# Uso: [ETIQUETA=vX.Y.Z-rc.N] [AMBIENTE=piloto] scripts/staging.sh [imagen-api] [imagen-portal]
#      (por omision, las imagenes de docker compose build). CONSERVAR=1 deja el ambiente arriba al terminar, y
#      .staging/ambiente.env sirve a scripts/respaldo.sh, restauracion.sh y rollback.sh.
#      JWT_SECRET, CONTRASENA_SEMILLA, CA_CRT y CA_KEY (PEM) se toman del entorno si vienen; si no, se generan.
set -euo pipefail

IMAGEN_API="${1:-sce-api:local}"
IMAGEN_PORTAL="${2:-sce-portal:local}"
RED=sce-staging
SUBRED=172.30.250
DB_IP=$SUBRED.10
BASE="$PWD/.staging" # bajo $HOME, que es lo que Colima monta; fuera de reportes/, que CI publica
REPORTES=reportes/staging
CLAVE_APP="$(openssl rand -hex 24)"
CONTRASENA_SEMILLA="${CONTRASENA_SEMILLA:-$(openssl rand -hex 16)}" # staging.yml la pasa para Playwright
AMBIENTE="${AMBIENTE:-staging}"
[ "$AMBIENTE" = piloto ] && SEMILLA=0
export CONTRASENA_SEMILLA AMBIENTE SEMILLA="${SEMILLA:-1}"
CERTS="$BASE/app/proxy/certificados/live/localhost"

falla() { echo "::error::$1" >&2; exit 1; }
db_compose() { (cd "$BASE/db" && docker compose "$@"); }
app_compose() { (cd "$BASE/app" && COMPOSE_FILE=compose.yml:red.yml docker compose "$@"); }
proxy_compose() { (cd "$BASE/app/proxy" && docker compose "$@"); }
limpiar() {
  [ "${CONSERVAR:-}" = 1 ] && return
  proxy_compose down >/dev/null 2>&1 || true
  app_compose --profile tareas down -v --remove-orphans >/dev/null 2>&1 || true
  db_compose down -v >/dev/null 2>&1 || true
  docker network rm "$RED" >/dev/null 2>&1 || true
}
trap 'estado=$?; [ $estado -eq 0 ] || { proxy_compose logs --tail 40 2>/dev/null; app_compose logs --tail 80 2>/dev/null; db_compose logs --tail 80 2>/dev/null; }; limpiar' EXIT

limpiar
rm -rf "$BASE" && mkdir -p "$BASE/db" "$CERTS" "$BASE/app/proxy/acme"
docker network create --subnet "$SUBRED.0/24" "$RED" >/dev/null

# Servidor de base: solo el rango .16 a .31 es "el servidor de aplicacion".
cp infra/staging/db/* "$BASE/db/"
cat > "$BASE/db/red.yml" <<EOF
services:
  db:
    ports: !reset []
    networks: { privada: { ipv4_address: $DB_IP } }
networks: { privada: { external: true, name: $RED } }
EOF
printf '%s\n' "COMPOSE_FILE=compose.yml:red.yml" "POSTGRES_PASSWORD=$(openssl rand -hex 16)" \
  "SCE_APP_PASSWORD=$CLAVE_APP" "RED_APP=$SUBRED.16/28" "NOMBRE_DB=$DB_IP" "ESCUCHA=127.0.0.1" > "$BASE/db/.env"
db_compose up -d --build --wait --wait-timeout 120

# Servidor de aplicacion: certificado para localhost (autofirmado, o firmado por la CA del ambiente si viene en CA_CRT y
# CA_KEY, como en el piloto de ensayo), y la API y las tareas dentro del rango permitido.
if [ -n "${CA_CRT:-}" ] && [ -n "${CA_KEY:-}" ]; then
  (umask 077 && printf '%s\n' "$CA_KEY" > "$BASE/ca.key") && printf '%s\n' "$CA_CRT" > "$BASE/ca.crt"
  openssl req -new -newkey rsa:2048 -nodes -subj /CN=localhost -keyout "$CERTS/privkey.pem" -out "$BASE/servidor.csr" 2>/dev/null
  printf 'subjectAltName=DNS:localhost\n' > "$BASE/san.ext"
  openssl x509 -req -in "$BASE/servidor.csr" -CA "$BASE/ca.crt" -CAkey "$BASE/ca.key" -CAcreateserial -days 2 \
    -extfile "$BASE/san.ext" -out "$CERTS/fullchain.pem" 2>/dev/null
  rm -f "$BASE/ca.key"
  openssl verify -CAfile "$BASE/ca.crt" "$CERTS/fullchain.pem" >/dev/null || falla "el certificado no lo firma la CA del ambiente"
  CA_CONFIANZA="$BASE/ca.crt"
else
  openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj /CN=localhost -addext subjectAltName=DNS:localhost \
    -keyout "$CERTS/privkey.pem" -out "$CERTS/fullchain.pem" 2>/dev/null
  CA_CONFIANZA="$CERTS/fullchain.pem"
fi
cat > "$BASE/app/red.yml" <<EOF
services:
  api:
    networks: { default: {}, privada: { ipv4_address: $SUBRED.20 } }
  tareas:
    networks: { default: {}, privada: { ipv4_address: $SUBRED.21 } }
networks: { privada: { external: true, name: $RED } }
EOF

export EN_DB="sh -c" EN_APP="env COMPOSE_FILE=compose.yml:red.yml sh -c" EN_PROXY="sh -c" DIR="$BASE/app"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
export ETIQUETA="${ETIQUETA:-commit-$(git rev-parse --short=12 HEAD)}" DOMINIO=localhost IMAGEN_API IMAGEN_PORTAL JWT_SECRET
export DATABASE_URL="postgresql://sce_app:$CLAVE_APP@$DB_IP:5432/sce?schema=public&sslmode=require&sslcert=/certs/db.crt&sslaccept=strict"
export URL=https://localhost CURL_CA_BUNDLE="$CA_CONFIANZA"
# Conexion al ambiente para respaldo, restauracion y rollback; queda en .staging, que no se publica.
(umask 077 && for v in EN_DB EN_APP EN_PROXY DIR URL CURL_CA_BUNDLE; do printf '%s=%q\n' "$v" "${!v}"; done \
  > "$BASE/ambiente.env")
if [ -n "${ETIQUETA_ANTERIOR:-}" ]; then
  ETIQUETA="$ETIQUETA_ANTERIOR" IMAGEN_API="${ANTERIOR_API:?}" IMAGEN_PORTAL="${ANTERIOR_PORTAL:?}" \
    scripts/desplegar-staging.sh > "$BASE/despliegue-anterior.txt"
  scripts/desplegar-staging.sh > "$BASE/despliegue-a-revertir.txt"
  AMBIENTE_ENV="$BASE/ambiente.env" scripts/rollback.sh "$ETIQUETA_ANTERIOR" "$ANTERIOR_API" "$ANTERIOR_PORTAL"
fi
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
mkdir -p "$REPORTES"
echo "base: rechaza otra direccion, sin TLS, TLS 1.1 y superusuario por red; acepta TLS verificado" \
  | tee "$REPORTES/rechazos.txt"

# pgAudit registro el DDL de las migraciones de esta corrida.
db_compose logs --no-log-prefix db > "$BASE/registro-db.txt"
grep -q 'sce_app@sce .*AUDIT: SESSION,.*,DDL,' "$BASE/registro-db.txt" || falla "pgAudit no registro el DDL de las migraciones"
echo "pgAudit: DDL registrado" | tee -a "$REPORTES/rechazos.txt"

NEWMAN_OPCIONES=--insecure scripts/verificar-staging.sh "$URL"
[ "$AMBIENTE" = piloto ] && { echo "Piloto de ensayo $ETIQUETA: ok"; exit 0; } # sin datos: no hay calidad que medir

# CD-DAT y Tabla 16 sobre lo que dejaron las migraciones, los datos sinteticos y el humo: desde una direccion del rango
# del servidor de aplicacion, por TLS y con la cuenta de la aplicacion, como entra la API.
export RED_DATOS="--network $RED --ip $SUBRED.23" \
  URL_DATOS="postgresql+psycopg2://sce_app:$CLAVE_APP@$DB_IP:5432/sce?sslmode=require"
(umask 077 && printf '%s=%q\n' RED_DATOS "$RED_DATOS" URL_DATOS "$URL_DATOS" >> "$BASE/ambiente.env")
scripts/calidad-datos.sh "$REPORTES/calidad-datos"
echo "Staging $ETIQUETA: ok"
