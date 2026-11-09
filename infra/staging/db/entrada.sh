#!/bin/sh
# Antes de PostgreSQL, ya como usuario postgres: certificado del servidor y reglas de acceso (Fig. 9, Tabla 38, CC-005).
# - El certificado se genera una vez, en el volumen; el servidor de aplicacion lo usa como CA para verificarlo.
# - pg_hba.conf se reescribe en cada arranque desde RED_APP: solo el servidor de aplicacion entra, solo por TLS y solo
#   con SCRAM. El superusuario no entra por red. Lo que no coincide con una linea se rechaza.
set -eu
: "${RED_APP:?RED_APP: direccion o red del servidor de aplicacion, p. ej. 10.0.0.2/32}"
: "${NOMBRE_DB:?NOMBRE_DB: nombre o IP con que la API llega a la base; va en el certificado}"

TLS=/var/lib/postgresql/tls
if [ ! -s "$TLS/servidor.crt" ]; then
  case "$NOMBRE_DB" in
    *[!0-9.]*) SAN="DNS:$NOMBRE_DB" ;;
    *) SAN="IP:$NOMBRE_DB" ;;
  esac
  openssl req -x509 -newkey rsa:3072 -nodes -days 825 -subj "/CN=$NOMBRE_DB" -addext "subjectAltName=$SAN" \
    -keyout "$TLS/servidor.key" -out "$TLS/servidor.crt" 2>/dev/null
fi
chmod 600 "$TLS/servidor.key"

cat > /etc/sce/pg_hba.conf <<EOF
# TIPO   BASE  USUARIO   ORIGEN      METODO
local    all   postgres              peer
hostssl  sce   sce_app   $RED_APP    scram-sha-256
EOF

exec docker-entrypoint.sh "$@"
