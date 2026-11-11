# Acta de aceptación de fase — Fase 5

**Acta número:** ACT-F5-001
**Objeto:** fase 5, Piloto · release `v1.0.0`
**Manual de referencia:** SCE-MC-001 v2.0, secciones 10.1, 10.3 (Tabla 23, fila 5) y 10.4; Anexo B. Manual v3.0, apartado 2.3: la fase 5 queda preparada, no ejecutada.
**Fecha real de la decisión:** no aplica mientras no haya piloto; no se antedata
**Participantes:** Francisco Javier Martínez Peñas (Product Owner, QA y autor; desviación, NC-012), con asistente de IA declarado

> **Estado: preparada, no ejecutada (11 de noviembre de 2026, sub-batch 14.2).** La Tabla 23 pide para la fase 5 "uso real durante un semestre, informe de indicadores y dictamen de aceptación". No hay facultad piloto ni semestre: `v1.0.0` va a un piloto de ensayo sin usuarios ni datos (CC-022). Esta acta no acepta la fase 5. Registra qué quedó listo para ejecutarla y qué falta.

---

## 1. Condición mínima de la Tabla 23

"Uso real durante un semestre, informe de indicadores y dictamen de aceptación."

| Condición evaluada | Resultado | Evidencia |
|---|---|---|
| Uso real durante un semestre | No ejecutada: no hay facultad piloto | `plan-de-evaluacion-piloto.md`, apartado 1 |
| Informe de indicadores | Plantilla preparada, sin datos | `docs/calidad/informe-cierre-piloto.md` |
| Dictamen de aceptación | El de `v1.0.0` evalúa conformidad y calificación; la idoneidad queda "no evaluada" | `docs/calidad/dictamen-25040.md` (14.1) |

## 2. Lo preparado

| Elemento | Dónde | Fuente |
|---|---|---|
| Plan de evaluación, con la prohibición de controles paralelos | `docs/gobierno/plan-de-evaluacion-piloto.md` | Tablas 10 y 13; 7.2 |
| Informe de cierre con los comandos de la Tabla 59 | `docs/calidad/informe-cierre-piloto.md` | 7.2 y 38 |
| Lista de la auditoría de cierre del semestre | `docs/calidad/auditoria-cierre-semestre.md` | Tabla 60 y Anexo F |
| Plantilla de incidente | `.github/ISSUE_TEMPLATE/incidente.yml` | 37; Tablas 38 y 52 |
| Cambio de emergencia documentado en 24 h | `.github/ISSUE_TEMPLATE/cambio.yml` | 37; Tabla 34 |
| Gestión de problemas | `docs/gobierno/respuesta-a-incidentes.md`, apartado 6 | 37 |
| Operación recurrente: conciliación, respaldo, restauración, accesos y disponibilidad | `plan-de-evaluacion-piloto.md`, apartado 4; `continuidad.yml`, `seguridad-operativa.yml`, `api/prisma/verificacion/` | 34, 35 y 37 |
| Mantenimiento con 48 h de aviso | `docs/gobierno/plantilla-mantenimiento.md` | 37 |

## 3. Lo que impide ejecutarla

Las condiciones del apartado 1 de `plan-de-evaluacion-piloto.md`. Las que son no conformidades Mayor: NC-019 (pasarela real), NC-020 (SUS y lector de pantalla), NC-021 y NC-002, NC-009 a NC-011 (actas sin firma), NC-012 (separación de funciones) y NC-013 (auditor independiente).

## 4. Decisión

**Aceptada · Aceptada con condiciones · Rechazada · No ejecutada.** Propuesta del autor: **no ejecutada.** La fase 5 se acepta solo con el informe de cierre, el dictamen con idoneidad y la auditoría de cierre del semestre.

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner y QA (desviación, NC-012): registra que la fase queda preparada | Francisco Javier Martínez Peñas | | |
| Produjo | Francisco Javier Martínez Peñas | | |

> SJOM no firma: no revisó ningún entregable. El asistente de IA es coautor y no firma.
