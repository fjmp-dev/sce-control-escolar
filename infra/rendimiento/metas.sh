#!/usr/bin/env bash
# Metas de la Tabla 46 sobre una corrida de rendimiento (sec. 24). Lee los resultados del generador y, entre INICIO y FIN
# (segundos UNIX), los maximos de Prometheus (infra/monitoreo). Escribe <dir>/metas.md.
# - Percentil 95 por operacion: inscripcion, pago e ingreso (POST) contra 3 s; consultas (GET) contra 2 s.
# - Tasa de error: 5xx y peticiones sin respuesta, menos de 1 %.
# - CPU de cada servidor menor a 80 % (promedio de sus nucleos, ventana de 1 min). Conexiones: las activas de la base
#   por debajo de connection_limit=20 y ningun 503, que es como la API responde cuando el pool se agota.
# - Generador: si su nucleo pasa de 80 %, la corrida es invalida (lo que se mide seria el generador).
# Por caso: CR-REN-01 cumple o no con todo lo anterior; CR-REN-02 ademas con los umbrales de k6 (K6_SALIDA) y cero filas
# en cr-ren-02.sql (<dir>/cr-ren-02.txt); CR-REN-03 y 04 son informativos, con la serie por minuto y el punto de quiebre
# (primer minuto que rompe una meta); CR-REN-05 cumple si el p95 de la ultima media hora y la memoria de la API no crecen
# mas de 20 % frente a los minutos 15 a 45 (criterio del equipo para "sin fugas ni degradacion").
# Uso: INICIO=<s> FIN=<s> [K6_SALIDA=<codigo>] infra/rendimiento/metas.sh CR-REN-0N <dir>
#      Sale con 0 si cumple o es informativo, 1 si no cumple y 2 si la corrida es invalida.
set -euo pipefail
: "${INICIO:?}" "${FIN:?}"
exec python3 -I - "$1" "$2" <<'PY'
import csv, json, os, statistics, sys, urllib.parse, urllib.request
from collections import defaultdict

caso, dir_ = sys.argv[1], sys.argv[2]
PROM = os.environ.get("PROMETHEUS", "http://127.0.0.1:9090")
inicio, fin = int(os.environ["INICIO"]), int(os.environ["FIN"])
APP, DB, GEN = (os.environ.get(v, d) for v, d in (("CPUS_APP", "0|1"), ("CPUS_DB", "2"), ("CPUS_GENERADOR", "3")))
POOL = 20
lineas, falla = [], []


def serie(q):
    url = f"{PROM}/api/v1/query_range?" + urllib.parse.urlencode({"query": q, "start": inicio, "end": fin, "step": 15})
    r = json.load(urllib.request.urlopen(url, timeout=30))["data"]["result"]
    return [float(v) for _, v in r[0]["values"]] if r else []


def p(valores, q):
    v = sorted(valores)
    return v[min(len(v) - 1, int(q * len(v)))] if v else float("nan") # rango mas cercano, como JMeter


def meta(etiqueta):
    return 2000 if etiqueta.startswith("consulta") else 3000


cpu = lambda nucleos: serie(f'1 - avg(rate(node_cpu_seconds_total{{mode="idle",cpu=~"{nucleos}"}}[1m]))')
recursos = {
    "CPU del servidor de aplicacion (nucleos " + APP.replace("|", " y ") + ")": (cpu(APP), 0.8, "%"),
    "CPU del servidor de base (nucleo " + DB + ")": (cpu(DB), 0.8, "%"),
    "Conexiones activas de la base": (serie('sum(pg_stat_activity_count{datname="sce",state="active"})'), POOL, ""),
}
generador = cpu(GEN)
memoria = serie('sce_process_resident_memory_bytes{job="api"}')
abiertas = serie('sum(pg_stat_database_numbackends{datname="sce"})')

total = errores = codigos503 = 0
por_etiqueta, por_minuto = defaultdict(list), defaultdict(lambda: {"tx": [], "consulta": [], "err": 0, "n": 0, "hilos": 0})
jtl = os.path.join(dir_, "resultados.jtl")
if os.path.exists(jtl):
    filas = list(csv.DictReader(open(jtl)))
    t0 = min(int(f["timeStamp"]) for f in filas)
    for f in filas:
        codigo, ms, m = f["responseCode"], int(f["elapsed"]), (int(f["timeStamp"]) - t0) // 60000
        error = not codigo.isdigit() or codigo.startswith("5")
        total, errores, codigos503 = total + 1, errores + error, codigos503 + (codigo == "503")
        por_etiqueta[f["label"]].append(ms)
        b = por_minuto[m]
        b["consulta" if f["label"].startswith("consulta") else "tx"].append(ms)
        b["err"], b["n"], b["hilos"] = b["err"] + error, b["n"] + 1, max(b["hilos"], int(f["allThreads"]))

k6 = os.path.join(dir_, "k6.json")
if not os.path.exists(k6 if caso == "CR-REN-02" else jtl):
    falla.append("sin resultados del generador en " + dir_)
if os.path.exists(k6):
    d = json.load(open(k6))["metrics"]
    dur = d.get("http_req_duration{name:inscripcion}") or d["http_req_duration"]
    lineas.append("| Operacion | n | p50 (ms) | p90 (ms) | p95 (ms) | max (ms) | Meta p95 |\n|---|---|---|---|---|---|---|")
    lineas.append(f"| inscripcion | {d['enviadas']['count']} | {dur['med']:.0f} | {dur['p(90)']:.0f} | {dur['p(95)']:.0f} "
                  f"| {dur['max']:.0f} | 3000 |")
    if dur["p(95)"] > 3000:
        falla.append("p95 de inscripcion")
    lineas.append("")
    for c in ("enviadas", "confirmadas_carga5", "rechazadas_por_cupo", "respuestas_inesperadas"):
        lineas.append(f"- {c}: {d.get(c, {}).get('count', 0)}")
    if os.environ.get("K6_SALIDA", "0") != "0":
        falla.append(f"umbrales de k6 (salida {os.environ['K6_SALIDA']})")
    sql = open(os.path.join(dir_, "cr-ren-02.txt")).read().strip()
    lineas.append(f"- cr-ren-02.sql, enviadas contra persistidas: {'cero filas' if not sql else sql}")
    if sql:
        falla.append("perdida o duplicacion (cr-ren-02.sql)")

if por_etiqueta:
    lineas.append("| Operacion | n | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Meta p95 (ms) | Cumple |\n|---|---|---|---|---|---|---|---|")
    for e, v in sorted(por_etiqueta.items()):
        ok = p(v, 0.95) <= meta(e)
        lineas.append(f"| {e} | {len(v)} | {p(v, .5)} | {p(v, .9)} | {p(v, .95)} | {p(v, .99)} | {meta(e)} | {'si' if ok else 'no'} |")
        if not ok and caso in ("CR-REN-01", "CR-REN-05"):
            falla.append(f"p95 de {e}")
    tasa = errores / total
    lineas.append(f"\n- Peticiones: {total}. Con 5xx o sin respuesta: {errores} ({tasa:.2%}); meta: menos de 1 %. 503: {codigos503}")
    if tasa >= 0.01 and caso != "CR-REN-03":
        falla.append("tasa de error")

lineas.append("\n| Recurso (Prometheus, cada 15 s) | Maximo | Meta | Cumple |\n|---|---|---|---|")
for nombre, (v, limite, unidad) in recursos.items():
    if not v:
        lineas.append(f"| {nombre} | sin datos | < {limite} | no |")
        falla.append(f"{nombre}: sin datos")
        continue
    ok = max(v) < limite and (nombre != "Conexiones activas de la base" or codigos503 == 0)
    fmt = (lambda x: f"{x:.1%}") if unidad == "%" else (lambda x: f"{x:.0f}")
    lineas.append(f"| {nombre} | {fmt(max(v))} | < {fmt(limite)} | {'si' if ok else 'no'} |")
    if not ok and caso != "CR-REN-03":
        falla.append(nombre)
lineas.append(f"\n- Conexiones abiertas a la base (incluye las ociosas del pool y el monitoreo): maximo {max(abiertas, default=0):.0f}")
lineas.append(f"- CPU del generador (nucleo {GEN}): maximo {max(generador, default=0):.1%}; la corrida es invalida desde 80 %")
if memoria:
    lineas.append(f"- Memoria residente de la API: {memoria[0] / 2**20:.0f} MiB al inicio, {max(memoria) / 2**20:.0f} MiB maximo, "
                  f"{memoria[-1] / 2**20:.0f} MiB al final")

if por_minuto and caso in ("CR-REN-03", "CR-REN-04", "CR-REN-05"):
    lineas.append("\n| Minuto | Usuarios | Peticiones | p95 transacciones (ms) | p95 consultas (ms) | 5xx o sin respuesta |\n|---|---|---|---|---|---|")
    quiebre = None
    for m in sorted(por_minuto):
        b = por_minuto[m]
        tx, co, err = p(b["tx"], .95), p(b["consulta"], .95), b["err"] / b["n"]
        if quiebre is None and (tx > 3000 or co > 2000 or err >= 0.01):
            quiebre = (m, b["hilos"])
        lineas.append(f"| {m} | {b['hilos']} | {b['n']} | {tx} | {co} | {err:.2%} |")
    lineas.append("\n- Punto de quiebre: " + (f"minuto {quiebre[0]}, con {quiebre[1]} usuarios" if quiebre else "no se alcanzo"))
    if caso == "CR-REN-05":
        todos = lambda a, b: [x for m in range(a, b) for x in por_minuto[m]["tx"] + por_minuto[m]["consulta"]]
        ultimo = max(por_minuto)
        referencia, final = p(todos(15, 45), .95), p(todos(ultimo - 29, ultimo + 1), .95)
        lineas.append(f"- Degradacion: p95 de los minutos 15 a 45 = {referencia} ms; de la ultima media hora = {final} ms")
        if final > 1.2 * referencia:
            falla.append("degradacion del p95")
        if memoria:
            base_mem = memoria[min(len(memoria) - 1, 60)]  # minuto 15, con pasos de 15 s
            lineas.append(f"- Fugas: memoria de la API {base_mem / 2**20:.0f} MiB en el minuto 15 y {memoria[-1] / 2**20:.0f} MiB al final")
            if memoria[-1] > 1.2 * base_mem:
                falla.append("crecimiento de memoria de la API")

if generador and max(generador) >= 0.8:
    resultado, salida = "INVALIDA: el generador paso de 80 % de CPU", 2
elif caso in ("CR-REN-03", "CR-REN-04"):
    resultado, salida = "Informativo (Tabla 47: punto de quiebre y reaccion)" + (f"; fuera de meta: {', '.join(falla)}" if falla else ""), 0
elif falla:
    resultado, salida = "NO CUMPLE: " + ", ".join(dict.fromkeys(falla)), 1
else:
    resultado, salida = "CUMPLE", 0
lineas.append(f"\n**Resultado {caso}:** {resultado}")
open(os.path.join(dir_, "metas.md"), "w").write("\n".join(lineas) + "\n")
print("\n".join(lineas))
sys.exit(salida)
PY
