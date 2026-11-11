#!/usr/bin/env bash
# CO-COM-01: tabla Markdown navegador x resolución x resultado, desde el JUnit de scripts/playwright.sh. Es la evidencia
# de la sección 27: fecha, etiqueta y resultado por combinación. Cada proyecto se llama prioridad-navegador-resolución
# (web/playwright.config.ts) y el JUnit lo trae en el atributo hostname de cada testsuite.
# Uso: [ETIQUETA=vX.Y.Z] scripts/matriz-compatibilidad.sh <junit.xml>... > matriz.md
set -euo pipefail
[ $# -gt 0 ] || { echo "uso: $0 <junit.xml>..." >&2; exit 1; }

echo "### Matriz de compatibilidad (Tabla 50, CO-COM-01)"
echo
echo "- Fecha: $(date -u +%FT%TZ)"
echo "- Etiqueta: ${ETIQUETA:-$(git describe --tags --always 2>/dev/null || echo 'sin etiqueta')}"
echo
echo '| Navegador | Resolución | Prioridad | Pruebas | Fallidas | Resultado | Specs con fallas |'
echo '|---|---|---|---|---|---|---|'
grep -ho '<testsuite [^>]*>' "$@" | awk '
  function atributo(nombre) {
    if (!match($0, " " nombre "=\"[^\"]*\"")) return ""
    return substr($0, RSTART + length(nombre) + 3, RLENGTH - length(nombre) - 4)
  }
  {
    p = atributo("hostname")
    if (!(p in pruebas)) orden[++n] = p
    pruebas[p] += atributo("tests") - atributo("skipped")
    f = atributo("failures") + atributo("errors")
    fallas[p] += f
    if (f > 0) specs[p] = specs[p] (specs[p] == "" ? "" : ", ") atributo("name")
  }
  END {
    for (i = 1; i <= n; i++) {
      p = orden[i]
      k = split(p, t, "-")
      navegador = t[2]
      for (j = 3; j < k; j++) navegador = navegador " " t[j]
      resultado = (pruebas[p] == 0) ? "Sin ejecutar" : ((fallas[p] > 0) ? "Falla" : "Pasa")
      prioridad = (t[1] == "must") ? "Must" : "Should"
      printf "| %s | %s | %s | %d | %d | %s | %s |\n", navegador, t[k], prioridad, pruebas[p], fallas[p], resultado, specs[p]
    }
  }'
