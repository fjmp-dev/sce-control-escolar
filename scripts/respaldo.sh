#!/usr/bin/env bash
# Respaldo cifrado (20.2, Tabla 30; CO-FIA-02). pg_dump en formato personalizado, cifrado con age para el destinatario
# de infra/respaldos/destinatario.txt: la llave privada no esta en el servidor ni en el repositorio
# (docs/gobierno/cifrado-y-claves.md). Junto al respaldo van los conteos por tabla, con que la restauracion comprueba que
# no falta nada, y los registros de los contenedores, tambien cifrados (Tabla 62). Agrega una fila a inventario.csv,
# borra lo que pasa de RETENCION_DIAS y prueba que el archivo no se lee sin la llave.
# Uso: scripts/respaldo.sh <directorio> [contenedor con registro...]
#      Conexion al ambiente en AMBIENTE_ENV (por omision .staging/ambiente.env, que deja scripts/staging.sh): EN_DB y
#      EN_APP, como en scripts/desplegar-staging.sh.
set -euo pipefail
DESTINO="${1:?directorio de respaldos}"
shift
set -a
# shellcheck disable=SC1090
[ -f "${AMBIENTE_ENV:-.staging/ambiente.env}" ] && . "${AMBIENTE_ENV:-.staging/ambiente.env}"
set +a
: "${EN_DB:?}"
EN_APP="${EN_APP:-$EN_DB}"
RETENCION_DIAS="${RETENCION_DIAS:-30}"
DESTINATARIO="${AGE_DESTINATARIO:-$(cat infra/respaldos/destinatario.txt)}"
falla() { echo "::error::$1" >&2; exit 1; }

nombre="sce-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$DESTINO"
$EN_DB "docker exec -u postgres sce-db pg_dump -Fc -d sce" | age -r "$DESTINATARIO" -o "$DESTINO/$nombre.dump.age"
$EN_DB "docker exec -i -u postgres sce-db psql -d sce -v ON_ERROR_STOP=1 -At" < api/prisma/verificacion/conteos.sql \
  > "$DESTINO/$nombre.conteos"
{
  $EN_DB "docker logs --timestamps sce-db" 2>&1
  for c in "$@"; do echo "=== $c"; $EN_APP "docker logs --timestamps $c" 2>&1; done
} | gzip | age -r "$DESTINATARIO" -o "$DESTINO/$nombre.registros.gz.age"

# Prueba negativa: el respaldo no esta en claro y otra llave no lo abre.
! head -c 5 "$DESTINO/$nombre.dump.age" | grep -q PGDMP || falla "el respaldo quedo en claro"
! age -d -i <(age-keygen 2>/dev/null) "$DESTINO/$nombre.dump.age" >/dev/null 2>&1 || falla "otra llave descifra el respaldo"

[ -s "$DESTINO/inventario.csv" ] || echo "fecha,archivo,bytes,sha256,etiqueta,filas" > "$DESTINO/inventario.csv"
filas="$(awk -F'|' '{s += $2} END {print s + 0}' "$DESTINO/$nombre.conteos")"
printf '%s,%s,%s,%s,%s,%s\n' "$(date -u +%FT%TZ)" "$nombre.dump.age" "$(wc -c < "$DESTINO/$nombre.dump.age" | tr -d ' ')" \
  "$(shasum -a 256 "$DESTINO/$nombre.dump.age" | cut -d' ' -f1)" "${ETIQUETA:-}" "$filas" >> "$DESTINO/inventario.csv"
find "$DESTINO" -maxdepth 1 -name 'sce-*' -mtime +"$RETENCION_DIAS" -print -delete | sed 's/^/retencion: borrado /'
echo "respaldo: $DESTINO/$nombre.dump.age ($filas filas, cifrado con age)"
