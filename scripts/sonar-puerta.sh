#!/usr/bin/env bash
# Puerta de calidad de la Tabla 51 sobre codigo nuevo, con SonarQube Community en un contenedor efimero.
#
# Community analiza una sola rama y no analiza pull requests. Para medir "codigo nuevo" se arma un repositorio
# de dos commits (arbol base y arbol evaluado) y se analizan en orden, con la definicion "version anterior":
# lo nuevo es exactamente el diff entre ambos, sin depender de las fechas de los commits reales.
#
# Uso: scripts/sonar-puerta.sh <commit-base> [commit-evaluado] [dir-reportes]
# Requiere docker, curl y jq. Lee la cobertura de api/coverage/. Sale con 1 si la puerta no aprueba.
set -euo pipefail

base=${1:?Uso: sonar-puerta.sh <commit-base> [commit-evaluado] [dir-reportes]}
evaluado=${2:-HEAD}
salida=$(mkdir -p "${3:-sonar-reporte}" && cd "${3:-sonar-reporte}" && pwd)
raiz=$(git rev-parse --show-toplevel)
trabajo="$raiz/.puerta" # dentro del repo: Colima solo monta $HOME, no el temporal de macOS
red=sce-puerta
servidor=sce-sonar
imagen=sonarqube:26.11.0.134175-community
escaner=sonarsource/sonar-scanner-cli:12.3
proyecto=sce-control-escolar
puerta=SCE-Tabla-51
url=http://localhost:9000

limpiar() {
  docker rm -fv "$servidor" >/dev/null 2>&1 || true
  docker network rm "$red" >/dev/null 2>&1 || true
  rm -rf "$trabajo"
}
trap limpiar EXIT
limpiar
mkdir -p "$trabajo"

docker network create "$red" >/dev/null
docker run -d --name "$servidor" --network "$red" -p 127.0.0.1:9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true "$imagen" >/dev/null
for _ in $(seq 1 120); do
  [ "$(curl -s "$url/api/system/status" | jq -r .status 2>/dev/null)" = UP ] && break
  sleep 3
done
[ "$(curl -s "$url/api/system/status" | jq -r .status)" = UP ] || { docker logs --tail 50 "$servidor"; exit 1; }

# Credencial por omision de la imagen: publica, de un servidor que solo escucha en 127.0.0.1 y muere con este script.
acceso=admin:admin
api() {
  local r
  r=$(curl -sS --fail-with-body -u "$acceso" -X POST "$url/api/$1" "${@:2}") || { echo "$1: $r" >&2; return 1; }
  echo "$r"
}
leer() { curl -sS --fail-with-body -u "$acceso" "$url/api/$1" "${@:2}"; }

api qualitygates/create -d "name=$puerta" >/dev/null
# Una puerta nueva trae las condiciones por omision de SonarQube; solo rigen las de la Tabla 51.
for id in $(leer "qualitygates/show?name=$puerta" | jq -r '.conditions[].id'); do
  api qualitygates/delete_condition -d "id=$id" >/dev/null
done
# Filas de la Tabla 51 que rechazan el pull request. Menor al 3 % significa que 3.00 ya no pasa.
# new_security_rating 2 = B; C, D y E son vulnerabilidades mayores, criticas o bloqueantes.
for condicion in new_coverage:LT:80 new_blocker_violations:GT:0 new_critical_violations:GT:0 \
  new_duplicated_lines_density:GT:2.99 new_security_rating:GT:2; do
  IFS=: read -r metrica op umbral <<<"$condicion"
  api qualitygates/create_condition -d "gateName=$puerta" -d "metric=$metrica" -d "op=$op" -d "error=$umbral" >/dev/null
done
api qualitygates/set_as_default -d "name=$puerta"
# El perfil por omision (core) tiene 199 reglas; comprehensive es el integrado mas amplio, con 440.
api qualityprofiles/set_default -d language=ts -d "qualityProfile=Sonar way comprehensive"
api projects/create -d "project=$proyecto" -d "name=SCE" >/dev/null
api new_code_periods/set -d "project=$proyecto" -d type=PREVIOUS_VERSION
token=$(api user_tokens/generate -d name=puerta | jq -r .token)

analizar() { # version fecha
  docker run --rm --network "$red" -v "$trabajo/repo:/usr/src" \
    -e SONAR_HOST_URL="http://$servidor:9000" -e SONAR_TOKEN="$token" \
    "$escaner" -Dsonar.projectVersion="$1" -Dsonar.projectDate="$2"
  for _ in $(seq 1 100); do
    tarea=$(leer "ce/component?component=$proyecto")
    [ "$(jq '.queue | length' <<<"$tarea")" = 0 ] && [ "$(jq -r .current.status <<<"$tarea")" != null ] && break
    sleep 3
  done
  # Falla cerrada: sin analisis terminado, SonarQube responde OK sin haber medido nada.
  [ "$(jq -r .current.status <<<"$tarea")" = SUCCESS ] || { jq . <<<"$tarea"; return 1; }
}
hace() { jq -nr --argjson h "$1" 'now - $h * 3600 | strftime("%Y-%m-%dT%H:%M:%S+0000")'; }
commit() { # fecha mensaje
  git -C "$trabajo/repo" add -A
  GIT_COMMITTER_DATE="$1" git -C "$trabajo/repo" -c user.name=puerta -c user.email=puerta@sce.test \
    commit -q --allow-empty --date="$1" -m "$2"
}
arbol() { git -C "$raiz" archive "$1" | tar -x -C "$trabajo/repo"; }

# Fechas recientes: SonarQube purga los analisis con mas de cinco anos.
git init -q "$trabajo/repo"
arbol "$base"
# La configuracion del analisis es la del commit evaluado: el base puede no tenerla.
git -C "$raiz" show "$evaluado:sonar-project.properties" >"$trabajo/repo/sonar-project.properties"
commit "$(hace 72)" base
analizar base "$(hace 48)" >"$salida/escaner-base.log" 2>&1 || { cat "$salida/escaner-base.log"; exit 1; }

find "$trabajo/repo" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
arbol "$evaluado"
[ -d "$raiz/api/coverage" ] && cp -R "$raiz/api/coverage" "$trabajo/repo/api/"
commit "$(hace 24)" evaluado
analizar evaluado "$(hace 1)" >"$salida/escaner-evaluado.log" 2>&1 || { cat "$salida/escaner-evaluado.log"; exit 1; }

leer "qualitygates/project_status?projectKey=$proyecto" >"$salida/puerta.json"
leer "measures/component?component=$proyecto&metricKeys=new_lines,new_coverage,new_blocker_violations,new_critical_violations,new_duplicated_lines_density,new_vulnerabilities,new_security_rating,new_technical_debt,new_bugs,new_code_smells" \
  >"$salida/medidas.json"
leer "issues/search?components=$proyecto&inNewCodePeriod=true&ps=500" >"$salida/hallazgos.json"

medida() { jq -r --arg m "$1" '[.component.measures[] | select(.metric == $m) | (.period.value // .value)][0] // "sin dato"' "$salida/medidas.json"; }
estado=$(jq -r .projectStatus.status "$salida/puerta.json")
deuda=$(medida new_technical_debt)
{
  echo "### Puerta de calidad, Tabla 51: $estado"
  echo
  echo "| Indicador | Umbral | Medido |"
  echo "|---|---|---|"
  echo "| Cobertura en codigo nuevo | >= 80 % | $(medida new_coverage) |"
  echo "| Errores bloqueantes | 0 | $(medida new_blocker_violations) |"
  echo "| Errores criticos | 0 | $(medida new_critical_violations) |"
  echo "| Duplicidad en codigo nuevo | < 3 % | $(medida new_duplicated_lines_density) |"
  echo "| Calificacion de seguridad (1 = A, 2 = B) | <= 2 | $(medida new_security_rating) |"
  echo "| Deuda tecnica, en minutos (no rechaza: se documenta y se agenda) | < 480 | $deuda |"
  echo
  echo "Lineas nuevas: $(medida new_lines). Commit evaluado: $(git -C "$raiz" rev-parse "$evaluado"). Base: $(git -C "$raiz" rev-parse "$base")."
} | tee "$salida/resumen.md"

# La fila de deuda de la Tabla 51 no rechaza, y SonarQube no tiene condiciones de advertencia: se avisa aqui.
if [ "$deuda" != "sin dato" ] && [ "$deuda" -ge 480 ]; then
  echo "::warning::Deuda tecnica nueva de $deuda minutos, un dia o mas: documentarla en el pull request y agendarla (Tabla 51)."
fi
[ "$estado" = OK ] || { jq -c '.projectStatus.conditions[] | select(.status == "ERROR")' "$salida/puerta.json"; exit 1; }
