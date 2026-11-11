#!/usr/bin/env python3
"""Disponibilidad mensual (RNF-FIA-001, CO-FIA-01; manual sec. 7 y 35).

Meta: 99,0 % en semana de inscripción y cortes de evaluación, y 98,0 % el resto del semestre. Se excluyen solo las
ventanas de mantenimiento anunciadas con al menos 48 horas y fuera de la semana de inscripción; una ventana mal
anunciada cuenta como caída.

Entradas (CSV con encabezado, fechas ISO 8601 en UTC):
  salud       fecha,ok           una muestra por sondeo; ok = 1 si la API y la web respondieron
  calendario  tipo,inicio,fin,anunciado
              tipo = inscripcion | corte | mantenimiento; anunciado solo aplica a mantenimiento
              (plantilla: docs/gobierno/plantilla-mantenimiento.md)

Uso: scripts/disponibilidad.py salud.csv calendario.csv   (sale con 1 si un mes no cumple)
     scripts/disponibilidad.py --autoprueba
     Las muestras salen de Prometheus: scripts/monitoreo.sh guarda probe_success con query_range.
"""
import csv
import sys
from collections import defaultdict
from datetime import datetime, timedelta

META_CRITICA, META_RESTO = 0.99, 0.98
AVISO = timedelta(hours=48)


def fecha(texto):
    return datetime.fromisoformat(texto.strip().replace("Z", "+00:00"))


def leer_calendario(filas):
    criticos, mantenimientos, invalidas = [], [], []
    for f in filas:
        rango = (fecha(f["inicio"]), fecha(f["fin"]))
        if f["tipo"] in ("inscripcion", "corte"):
            criticos.append((f["tipo"], *rango))
        elif f["tipo"] == "mantenimiento":
            mantenimientos.append((rango, fecha(f["anunciado"]) if f.get("anunciado") else None))
        else:
            raise ValueError(f"tipo desconocido: {f['tipo']}")
    validas = []
    for rango, anunciado in mantenimientos:
        en_inscripcion = any(t == "inscripcion" and rango[0] < fin and ini < rango[1] for t, ini, fin in criticos)
        if anunciado is not None and rango[0] - anunciado >= AVISO and not en_inscripcion:
            validas.append(rango)
        else:
            invalidas.append(rango)
    return criticos, validas, invalidas


def calcular(muestras, criticos, mantenimientos):
    """muestras: [(fecha, ok)]. Devuelve {mes: {critico|resto: (arriba, total)}}."""
    meses = defaultdict(lambda: {"critico": [0, 0], "resto": [0, 0]})
    for cuando, ok in muestras:
        if any(ini <= cuando < fin for ini, fin in mantenimientos):
            continue
        clase = "critico" if any(ini <= cuando < fin for _, ini, fin in criticos) else "resto"
        cuenta = meses[cuando.strftime("%Y-%m")][clase]
        cuenta[0] += ok
        cuenta[1] += 1
    return meses


def informe(meses):
    filas, cumple = [], True
    for mes in sorted(meses):
        for clase, meta in (("critico", META_CRITICA), ("resto", META_RESTO)):
            arriba, total = meses[mes][clase]
            if not total:
                continue
            valor = arriba / total
            ok = valor >= meta
            cumple &= ok
            filas.append(f"| {mes} | {'inscripción y cortes' if clase == 'critico' else 'resto'} | {total} | "
                         f"{valor:.3%} | {meta:.1%} | {'cumple' if ok else 'NO cumple'} |")
    return cumple, ["| Mes | Periodo | Muestras | Disponibilidad | Meta | Resultado |", "|---|---|---|---|---|---|", *filas]


def autoprueba():
    d = lambda t: fecha(t)  # noqa: E731
    cal = [
        {"tipo": "inscripcion", "inicio": "2027-01-04T00:00Z", "fin": "2027-01-11T00:00Z", "anunciado": ""},
        # anunciada 72 h antes, fuera de inscripción: se excluye
        {"tipo": "mantenimiento", "inicio": "2027-01-20T02:00Z", "fin": "2027-01-20T04:00Z", "anunciado": "2027-01-17T02:00Z"},
        # anunciada 24 h antes: cuenta como caída
        {"tipo": "mantenimiento", "inicio": "2027-01-25T02:00Z", "fin": "2027-01-25T03:00Z", "anunciado": "2027-01-24T02:00Z"},
        # dentro de inscripción: cuenta aunque se anuncie con tiempo
        {"tipo": "mantenimiento", "inicio": "2027-01-05T02:00Z", "fin": "2027-01-05T03:00Z", "anunciado": "2026-12-20T00:00Z"},
    ]
    criticos, validas, invalidas = leer_calendario(cal)
    assert len(validas) == 1 and len(invalidas) == 2
    # Un mes de muestras cada 5 minutos, con caída en la ventana válida, en la mal anunciada y 2 h en inscripción.
    muestras, t = [], d("2027-01-01T00:00Z")
    while t < d("2027-02-01T00:00Z"):
        caido = (d("2027-01-20T02:00Z") <= t < d("2027-01-20T04:00Z") or d("2027-01-25T02:00Z") <= t < d("2027-01-25T03:00Z")
                 or d("2027-01-05T02:00Z") <= t < d("2027-01-05T04:00Z"))
        muestras.append((t, 0 if caido else 1))
        t += timedelta(minutes=5)
    meses = calcular(muestras, criticos, validas)
    arriba, total = meses["2027-01"]["critico"]
    assert total == 7 * 288 and total - arriba == 24, (arriba, total)  # 2 h caída en inscripción = 24 muestras
    arriba, total = meses["2027-01"]["resto"]
    assert total == 24 * 288 - 24 and total - arriba == 12, (arriba, total)  # la ventana válida no cuenta; 1 h sí
    cumple, tabla = informe(meses)  # 2 h de 168 en inscripción no cumplen 99 %; 1 h de 574 sí cumple 98 %
    assert not cumple and "98.810% | 99.0% | NO cumple" in tabla[2] and "99.826% | 98.0% | cumple" in tabla[3], tabla
    meses["2027-01"]["critico"] = [990, 1000]  # valor límite: 99,0 % exacto cumple
    assert informe(meses)[0]
    meses["2027-01"]["critico"] = [989, 1000]
    assert not informe(meses)[0]
    print("autoprueba de disponibilidad.py: ok")


def main(argv):
    if argv[1:] == ["--autoprueba"]:
        return autoprueba()
    if len(argv) != 3:
        sys.exit(__doc__)
    with open(argv[1]) as s, open(argv[2]) as c:
        muestras = [(fecha(f["fecha"]), int(f["ok"])) for f in csv.DictReader(s)]
        criticos, validas, invalidas = leer_calendario(csv.DictReader(c))
    cumple, tabla = informe(calcular(muestras, criticos, validas))
    print("\n".join(tabla))
    for ini, fin in invalidas:
        print(f"\nMantenimiento {ini:%Y-%m-%d %H:%M}–{fin:%H:%M} UTC cuenta como caída: sin 48 h de aviso o en inscripción.")
    sys.exit(0 if cumple else 1)


if __name__ == "__main__":
    main(sys.argv)
