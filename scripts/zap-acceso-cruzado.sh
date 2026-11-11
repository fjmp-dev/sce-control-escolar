#!/usr/bin/env bash
# CS-SEG-03 (Tabla 49) con OWASP ZAP: un alumno no alcanza lo de otro. Se escanea con el token del alumno B un OpenAPI
# reducido a las operaciones que llevan un identificador del alumno A (su matrícula, su cuenta de usuario, su inscripción,
# un pago aplicado, uno pendiente y un trámite emitido con su documento), fijado en la ruta. Criterios: B no recibe ningún
# 2xx en esas operaciones, cada una recibió peticiones de B, lo de A queda igual visto por A y cero altas (Tabla 51).
# Contra un ambiente ya levantado con docker compose y su semilla sintética (Tabla 30).
# Uso: [API=http://localhost:3001] [CONTRASENA_SEMILLA=...] scripts/zap-acceso-cruzado.sh [dir-de-reportes]
set -euo pipefail

API="${API:-http://localhost:3001}"
REPORTES="${1:-reportes/zap-acceso-cruzado}"
IMAGEN="ghcr.io/zaproxy/zaproxy:2.17.0"
CONTRASENA="${CONTRASENA_SEMILLA:-sce-dev-2026}"

rm -rf "$REPORTES"
mkdir -p "$REPORTES"
chmod a+rwx "$REPORTES"

iniciar() {
  curl -sf -X POST "$API/sesiones" -H 'Content-Type: application/json' \
    -d "{\"correo\":\"$1\",\"contrasena\":\"$CONTRASENA\"}" | jq -er .token
}
llamar() { # método ruta token [cuerpo]
  curl -sf -X "$1" "$API$2" -H "Authorization: Bearer $3" -H 'Content-Type: application/json' ${4:+-d "$4"}
}

# A tiene adeudo en la semilla (D-10), así que puede pagar. B es el otro alumno con expediente.
A="$(iniciar alumno.dos@sce.test)"
B="$(iniciar alumno@sce.test)"
CONTROL="$(iniciar control.escolar@sce.test)"
USUARIO_A="$(llamar GET /sesiones/actual "$A" | jq -er .id)"
USUARIO_B="$(llamar GET /sesiones/actual "$B" | jq -er .id)"
MATRICULA="$(llamar GET /alumnos/actual "$A" | jq -er .matricula)"
INSCRIPCION="$(llamar GET /alumnos/actual/inscripciones "$A" | jq -er '.[0].folio')"
APLICADO="$(llamar POST /pagos "$A" '{"importe":100}' | jq -er .id)"
llamar POST "/pagos/$APLICADO/simulacion" "$A" '{"resultado":"aprobado"}' >/dev/null
PENDIENTE="$(llamar POST /pagos "$A" '{"importe":100}' | jq -er .id)"
TRAMITE="$(llamar POST /tramites "$A" '{"tipo":"constancia"}' | jq -er .folio)"
llamar POST "/tramites/$TRAMITE/proceso" "$CONTROL" >/dev/null
DOCUMENTO="$(llamar POST "/tramites/$TRAMITE/emision" "$CONTROL" | jq -er .documentoFolio)"

# Lo que A ve de sí mismo. Sin descargar el documento: la primera descarga del dueño lo deja Entregado (Fig. 6).
estado_de_a() {
  for ruta in /alumnos/actual /alumnos/actual/inscripciones /alumnos/actual/calificaciones /alumnos/actual/cuenta \
    /alumnos/actual/tramites "/pagos/$APLICADO"; do
    echo "== $ruta"
    llamar GET "$ruta" "$A" | jq -S .
  done
}
estado_de_a > "$REPORTES/a-antes.txt"

# Las operaciones con identificador del alumno A; cada plantilla, con el suyo. Los number del contrato pasan a integer:
# para number ZAP genera 1.2, que la validación rechaza (400) antes de comprobar de quién es el recurso.
jq --arg m "$MATRICULA" --arg u "$USUARIO_A" --arg i "$INSCRIPCION" --arg ap "$APLICADO" --arg pe "$PENDIENTE" \
  --arg t "$TRAMITE" --arg d "$DOCUMENTO" '
  def fijar($ruta; $param; $valor): .[$ruta | sub("\\{" + $param + "\\}"; $valor)] =
    (.[$ruta] | map_values(.parameters |= map(select(.name != $param)))) | del(.[$ruta]);
  .paths |= (with_entries(select(.key | test("\\{matricula\\}"))) + {
      "/usuarios/{id}": .["/usuarios/{id}"],
      "/inscripciones/{folio}/grupos": .["/inscripciones/{folio}/grupos"],
      "/pagos/{id}": .["/pagos/{id}"],
      "/pagos/{id}/simulacion": .["/pagos/{id}/simulacion"],
      "/tramites/{folio}/proceso": .["/tramites/{folio}/proceso"],
      "/tramites/{folio}/emision": .["/tramites/{folio}/emision"],
      "/tramites/{folio}/rechazo": .["/tramites/{folio}/rechazo"],
      "/tramites/{folio}/documento": .["/tramites/{folio}/documento"],
      "/documentos/{folio}": .["/documentos/{folio}"]
    }
    | reduce (keys[] | select(test("\\{matricula\\}"))) as $r (.; fijar($r; "matricula"; $m))
    | fijar("/usuarios/{id}"; "id"; $u) | fijar("/inscripciones/{folio}/grupos"; "folio"; $i)
    | fijar("/pagos/{id}"; "id"; $ap) | fijar("/pagos/{id}/simulacion"; "id"; $pe)
    | reduce ("proceso", "emision", "rechazo", "documento") as $o (.; fijar("/tramites/{folio}/\($o)"; "folio"; $t))
    | fijar("/documentos/{folio}"; "folio"; $d))
  | .components.schemas |= walk(if type == "object" and .type == "number" then .type = "integer" else . end)' \
  docs/api/openapi.json > "$REPORTES/openapi-a.json"
jq -r '.paths | keys[]' "$REPORTES/openapi-a.json"

antes="$(docker compose logs --no-log-prefix api | wc -l)"
estado=0
docker run --rm --network host -v "$PWD/$REPORTES:/zap/wrk:rw" "$IMAGEN" zap-api-scan.py \
  -t openapi-a.json -f openapi -O "$API" -I -r zap.html -J zap.json -w zap.md \
  -z "-config replacer.full_list(0).description=token \
      -config replacer.full_list(0).enabled=true \
      -config replacer.full_list(0).matchtype=REQ_HEADER \
      -config replacer.full_list(0).matchstr=Authorization \
      -config replacer.full_list(0).regex=false \
      -config replacer.full_list(0).replacement=Bearer\ $B" > "$REPORTES/zap.txt" 2>&1 || estado=$?
[ "$estado" -eq 0 ] || { tail -20 "$REPORTES/zap.txt"; echo "::error::zap-api-scan terminó con código $estado" >&2; exit 1; }

# Lo que B recibió, operación por operación, según el registro de la API.
docker compose logs --no-log-prefix api | tail -n "+$((antes + 1))" \
  | jq -Rc --arg b "$USUARIO_B" 'fromjson? | select(.context == "Peticiones") | .message | select(.usuario == $b)' \
  > "$REPORTES/peticiones-b.jsonl"
jq -s 'group_by("\(.metodo) \(.ruta)") | map({key: "\(.[0].metodo) \(.[0].ruta)",
    value: (group_by(.estado) | map({key: (.[0].estado | tostring), value: length}) | from_entries)}) | from_entries' \
  "$REPORTES/peticiones-b.jsonl" | tee "$REPORTES/resumen-b.json"

jq -r '.paths | to_entries[] | .key as $r | .value | keys[] | "\(ascii_upcase) \($r)"' "$REPORTES/openapi-a.json" \
  | sed -E "s#/$MATRICULA(/|$)#/:matricula\1#; s#/usuarios/$USUARIO_A#/usuarios/:id#; s#/$INSCRIPCION/#/:folio/#; \
      s#/pagos/($APLICADO|$PENDIENTE)#/pagos/:id#; s#/$TRAMITE/#/:folio/#; s#/documentos/$DOCUMENTO#/documentos/:folio#" \
  | sort > "$REPORTES/operaciones.txt"
jq -r 'keys[]' "$REPORTES/resumen-b.json" | sort | comm -23 "$REPORTES/operaciones.txt" - > "$REPORTES/sin-probar.txt"
[ ! -s "$REPORTES/sin-probar.txt" ] \
  || { cat "$REPORTES/sin-probar.txt"; echo "::error::ZAP no probó esas operaciones con el token de B" >&2; exit 1; }
exitos="$(jq -s 'map(select(.estado < 300)) | length' "$REPORTES/peticiones-b.jsonl")"
echo "CS-SEG-03: $(wc -l < "$REPORTES/peticiones-b.jsonl" | tr -d ' ') peticiones de B sobre $(wc -l < "$REPORTES/operaciones.txt" | tr -d ' ') operaciones de A, $exitos con 2xx"
[ "$exitos" -eq 0 ] || { echo "::error::el alumno B recibió $exitos respuestas 2xx sobre lo de A" >&2; exit 1; }

estado_de_a > "$REPORTES/a-despues.txt"
diff -u "$REPORTES/a-antes.txt" "$REPORTES/a-despues.txt" || { echo "::error::lo del alumno A cambió" >&2; exit 1; }
echo "CS-SEG-03: lo del alumno A quedó intacto"

altas="$(jq '[.site[].alerts[] | select(.riskcode == "3")] | length' "$REPORTES/zap.json")"
jq -r '.site[].alerts[] | "\(.riskdesc): \(.name) [\(.pluginid)] (\(.count))"' "$REPORTES/zap.json" | sort
echo "ZAP: $altas alertas altas"
[ "$altas" -eq 0 ] || { echo "::error::ZAP encontró $altas alertas altas" >&2; exit 1; }
