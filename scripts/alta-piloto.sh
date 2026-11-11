#!/usr/bin/env bash
# Alta de los secretos del environment "piloto" de GitHub (CC-022, 20.2; inventario-de-ambientes.md, apartado 4).
# Genera la firma de tokens, la contrasena de la semilla y una CA propia del ambiente, y las guarda como secretos del
# environment sin mostrarlas. La llave de la CA solo existe en un directorio temporal mientras se sube. Imprime la
# huella de la CA, que va al acta de liberacion. Volver a correrlo rota los secretos.
# Uso (con gh autenticado como administrador del repositorio): bash scripts/alta-piloto.sh
set -euo pipefail
REPO="${REPO:-fjmp-dev/sce-control-escolar}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
chmod 700 "$TMP"

openssl req -x509 -newkey rsa:3072 -nodes -days 400 -subj "/CN=SCE piloto de ensayo CA" \
  -addext basicConstraints=critical,CA:TRUE -addext keyUsage=critical,keyCertSign,cRLSign \
  -keyout "$TMP/ca.key" -out "$TMP/ca.crt" 2>/dev/null
openssl rand -hex 32 | tr -d '\n' | gh secret set JWT_SECRET --env piloto -R "$REPO"
openssl rand -hex 16 | tr -d '\n' | gh secret set CONTRASENA_SEMILLA --env piloto -R "$REPO"
gh secret set CA_CRT --env piloto -R "$REPO" < "$TMP/ca.crt"
gh secret set CA_KEY --env piloto -R "$REPO" < "$TMP/ca.key"

echo "CA del piloto: $(openssl x509 -noout -fingerprint -sha256 -in "$TMP/ca.crt" | cut -d= -f2)"
gh secret list --env piloto -R "$REPO"
