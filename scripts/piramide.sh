#!/usr/bin/env bash
# Pirámide de pruebas (Tabla 40: 70 % unitarias, 20 % integración y 10 % extremo a extremo) con la regla de conteo de
# docs/calidad/plan-de-pruebas.md, apartado 3: dos conteos por nivel, por caso y por archivo de pruebas.
# Solo avisa con ::warning::. Nunca falla, ni si falta un reporte: ese cuenta cero y también se avisa.
# Escribe las tablas en Markdown en la salida; ci.yml las agrega al resumen de la corrida ($GITHUB_STEP_SUMMARY).
# Uso: scripts/piramide.sh <jest-unitarias.json> <vitest.json> <jest-integracion.json> <dir-junit-cypress>
set -uo pipefail

aviso() { echo "::warning::$*" >&2; }
pct() { awk -v n="$1" -v t="$2" 'BEGIN { printf "%.1f", t ? 100 * n / t : 0 }'; }

# Jest y Vitest con --json: casos que corrieron, aprobados o fallidos (no los omitidos ni los pendientes), y archivos.
json() {
  [ -s "$1" ] || { aviso "pirámide: falta $1; cuenta cero"; echo "0 0"; return; }
  jq -r '"\(.numPassedTests + .numFailedTests) \(.testResults | length)"' "$1" || echo "0 0"
}

# Cypress en JUnit, un XML por spec: casos sin <skipped/>, y specs con algún caso.
junit() {
  local xml=("$1"/*.xml)
  [ -s "${xml[0]}" ] || { aviso "pirámide: no hay JUnit de Cypress en $1; cuenta cero"; echo "0 0"; return; }
  local casos omitidos
  casos="$(cat "${xml[@]}" | grep -o '<testcase' | wc -l)"
  omitidos="$(cat "${xml[@]}" | grep -o '<skipped' | wc -l)"
  echo "$((casos - omitidos)) $(grep -l '<testcase' "${xml[@]}" | wc -l)"
}

read -r jest_c jest_a <<< "$(json "${1:-}")"
read -r vitest_c vitest_a <<< "$(json "${2:-}")"
read -r integ_c integ_a <<< "$(json "${3:-}")"
read -r e2e_c e2e_a <<< "$(junit "${4:-.}")"
unit_c=$((jest_c + vitest_c)) unit_a=$((jest_a + vitest_a))
total_c=$((unit_c + integ_c + e2e_c)) total_a=$((unit_a + integ_a + e2e_a))
celda() { echo "$1 ($(pct "$1" "$2") %)"; }

cat <<EOF
### Pirámide de pruebas (Tabla 40)

Regla de conteo: \`docs/calidad/plan-de-pruebas.md\`, apartado 3. Solo informa: no detiene el pipeline.

| Fuente | Nivel | Casos | Archivos |
|---|---|---|---|
| Jest, API | Unitarias | $jest_c | $jest_a |
| Vitest, portal | Unitarias | $vitest_c | $vitest_a |
| Jest con Supertest y Testcontainers | Integración | $integ_c | $integ_a |
| Cypress | Extremo a extremo | $e2e_c | $e2e_a |

| Nivel | Meta | Por caso | Por archivo |
|---|---|---|---|
| Unitarias | 70 % o más | $(celda $unit_c $total_c) | $(celda $unit_a $total_a) |
| Integración | 20 % | $(celda $integ_c $total_c) | $(celda $integ_a $total_a) |
| Extremo a extremo | 10 % o menos | $(celda $e2e_c $total_c) | $(celda $e2e_a $total_a) |
EOF

# La forma se cumple con 70 % o más de unitarias y 10 % o menos de extremo a extremo; la integración es el resto.
forma() { awk -v u="$1" -v e="$2" -v t="$3" 'BEGIN { exit !(t > 0 && 100 * u >= 70 * t && 100 * e <= 10 * t) }'; }
forma $unit_c $e2e_c $total_c || aviso "pirámide por caso: $(pct $unit_c $total_c) % unitarias (meta 70 % o más) y" \
  "$(pct $e2e_c $total_c) % extremo a extremo (meta 10 % o menos)"
forma $unit_a $e2e_a $total_a || aviso "pirámide por archivo: $(pct $unit_a $total_a) % unitarias (meta 70 % o más) y" \
  "$(pct $e2e_a $total_a) % extremo a extremo (meta 10 % o menos)"
exit 0
