#!/usr/bin/env python3
"""SUS (System Usability Scale) de las sesiones de usabilidad, Anexo G y 26.1 del manual (meta: 70 o más).

Lee los CSV sus-<rol>.csv (participante,r1..r10, cada respuesta de 1 a 5) y escribe, en Markdown, el puntaje de cada
participante, la media por rol y si cumple la meta. Solo biblioteca estándar.
Uso: scripts/usabilidad/sus.py docs/anexos/anexo-G/sus-*.csv     (sin argumentos: autoprueba)
Sale con 1 si un rol tiene participantes y su media queda bajo la meta, o si una fila es inválida.
"""
import csv
import statistics
import sys
from pathlib import Path

META = 70.0


def puntaje(respuestas):
    """Impares: respuesta - 1; pares: 5 - respuesta; la suma por 2.5 (Brooke, 1996)."""
    if len(respuestas) != 10 or any(r not in (1, 2, 3, 4, 5) for r in respuestas):
        raise ValueError(f"se esperan 10 respuestas de 1 a 5: {respuestas}")
    return 2.5 * sum(r - 1 if i % 2 == 0 else 5 - r for i, r in enumerate(respuestas))


def leer(ruta):
    with open(ruta, newline="", encoding="utf-8") as f:
        return [(fila["participante"], [int(fila[f"r{i}"]) for i in range(1, 11)]) for fila in csv.DictReader(f)]


def informe(rutas):
    lineas, cumple = ["| Rol | Participantes | Puntajes | Media | Meta ≥ 70 |", "|---|---|---|---|---|"], True
    for ruta in rutas:
        rol = Path(ruta).stem.removeprefix("sus-")
        puntajes = [puntaje(r) for _, r in leer(ruta)]
        if not puntajes:
            lineas.append(f"| {rol} | 0 | — | — | Sin sesiones |")
            continue
        media = statistics.mean(puntajes)
        cumple &= media >= META
        lineas.append(f"| {rol} | {len(puntajes)} | {', '.join(f'{p:g}' for p in puntajes)} | {media:.1f} | "
                      f"{'Cumple' if media >= META else 'No cumple'} |")
    return "\n".join(lineas), cumple


def autoprueba():
    assert puntaje([3] * 10) == 50.0
    assert puntaje([5, 1] * 5) == 100.0
    assert puntaje([1, 5] * 5) == 0.0
    assert puntaje([4, 2, 4, 2, 4, 2, 4, 2, 4, 2]) == 75.0
    for malo in ([3] * 9, [0] + [3] * 9, [6] + [3] * 9):
        try:
            puntaje(malo)
        except ValueError:
            continue
        raise AssertionError(f"debió rechazar {malo}")
    print("autoprueba de sus.py: ok")


if __name__ == "__main__":
    if len(sys.argv) == 1:
        autoprueba()
        sys.exit(0)
    texto, ok = informe(sys.argv[1:])
    print(texto)
    sys.exit(0 if ok else 1)
