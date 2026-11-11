#!/usr/bin/env bash
# Cobertura de reglas Must (Tabla 59, CO-MAN-01): reglas Must con prueba automatizada entre reglas Must totales.
# Las reglas salen de la sección 2 de docs/calidad/reglas-de-negocio.md. Una regla cuenta si su ID (R-xx) aparece en
# el título de una prueba (describe, it, test o context) de api/test, web/test o web/cypress. El prefijo solo se pone
# en pruebas que verifican la regla: este conteo no lo comprueba, lo revisa quien aprueba el PR.
# Escribe el reporte en JSON, lo resume en la salida y sale con 1 si la cobertura es menor que 100 %.
# Uso: scripts/reglas-must.sh [reporte.json]
set -euo pipefail
cd "$(dirname "$0")/.."
REPORTE="${1:-reportes/reglas-must.json}"
mkdir -p "$(dirname "$REPORTE")"

reglas=$(sed -n '/^## 2\./,/^## 3\./p' docs/calidad/reglas-de-negocio.md | grep -oE '^\| R-[0-9]{2} ' | tr -d '| ' || true)
[ -n "$reglas" ] || { echo "::error::no hay reglas Must en la sección 2 de reglas-de-negocio.md" >&2; exit 1; }

# archivo:línea:título. El título es el primer texto de describe, it, test o context, también con .each, .only o
# .concurrent. No cuentan las pruebas que no corren o que se espera que fallen (.skip, .todo, .failing, xit, xdescribe)
# ni las líneas de comentario (//, /* o *). Un it.each de varias líneas cuenta por el título de su describe.
titulos=$(find api/test web/test web/cypress -name node_modules -prune -o -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -print 2>/dev/null | sort | while read -r f; do
  sed -E 's#^[[:space:]]*(//|/?\*).*##' "$f" |
    grep -noE "(^|[^[:alnum:]_.])(describe|it|test|context)(\.(each|only|concurrent))*(\([^)]*\))?\([[:space:]]*['\"\`][^'\"\`]*" |
    sed "s#^#$f:#" || true
done || true)

filas=""
sin_prueba=()
for r in $reglas; do
  pruebas=$(grep -E "^[^:]+:[0-9]+:.*[^0-9A-Za-z-]$r([^0-9]|$)" <<<"$titulos" | cut -d: -f1,2 || true)
  n=$(grep -c . <<<"$pruebas" || true)
  [ "$n" -gt 0 ] || sin_prueba+=("$r")
  printf '%s  %3d prueba(s)  %s\n' "$r" "$n" "$(head -1 <<<"$pruebas")"
  filas+=$(jq -cn --arg id "$r" --arg p "$pruebas" '{id: $id, pruebas: ($p | split("\n") | map(select(. != "")))}')$'\n'
done

total=$(wc -w <<<"$reglas" | tr -d ' ')
con_prueba=$((total - ${#sin_prueba[@]}))
jq -s --arg fecha "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --argjson total "$total" --argjson con "$con_prueba" '{
  caso: "CO-MAN-01", metrica: "Cobertura de reglas Must (Tabla 59)", fecha: $fecha,
  total: $total, con_prueba: $con, cobertura: ($con * 10000 / $total | floor / 100),
  sin_prueba: [.[] | select(.pruebas == []) | .id], reglas: .
}' <<<"$filas" >"$REPORTE"

echo "Reglas Must con prueba automatizada: $con_prueba de $total ($(jq .cobertura "$REPORTE") %). Reporte: $REPORTE"
if [ "${#sin_prueba[@]}" -gt 0 ]; then
  echo "::error::reglas Must sin prueba con su ID en el título: ${sin_prueba[*]}" >&2
  exit 1
fi
