# Auditoría interna de cierre del semestre piloto — Lista preparada

**Fuente:** SCE-MC-001 v2.0, sección 39 (Tabla 60) y Anexo F; ISO 19011:2018. Exigibilidad: PA-SCE-001, apartado 3 (fase 5: AU-31 a AU-35). **Sub-batch:** 14.2, issue #77.
**Estado: preparada, no ejecutada.** No hay semestre piloto (manual v3.0, apartado 2.3). La ejecuta un auditor que no desarrolle ni opere el SCE (39.1, NC-013) al cerrar el semestre, con `informe-cierre-piloto.md` lleno.

## 1. Programa (Tabla 60)

| Momento | Alcance | Criterios | Batch | Auditor | Fecha real |
|---|---|---|---|---|---|
| Cierre del semestre piloto | Operación y resultados | Indicadores de la sección 7, métricas de la sección 38 y no conformidades abiertas | 14 | Por designar (independiente) | Por definir |

## 2. Plan previo

- **Objetivo:** verificar que el piloto operó según `plan-de-evaluacion-piloto.md` y que sus resultados sostienen la decisión del Product Owner.
- **Muestra mínima:** un mes con semana de inscripción; 30 expedientes contra el archivo físico de la facultad; 25 asientos de bitácora por tipo; todos los incidentes, cambios de emergencia y defectos altos o críticos del semestre.
- **Métodos:** revisión documental, reejecución de las consultas de `api/prisma/verificacion/`, entrevista a un usuario por rol y observación de una sesión de inscripción.

## 3. Lista de verificación

| Criterio | Pregunta o verificación | Evidencia esperada | Resultado | Evidencia encontrada |
|---|---|---|---|---|
| Tabla 13 | ¿Se cumplió cada meta de la Tabla 13, medida según 7.2? | `informe-cierre-piloto.md`, apartado 2 | | |
| Tabla 59 | ¿Las 10 métricas se recalculan con los comandos del informe y dan lo mismo? | `informe-cierre-piloto.md`, apartado 3 | | |
| AU-31 | ¿El p95 y la concurrencia se midieron en el servidor del piloto (24.2)? | CR-REN del semestre; histograma de Prometheus | | |
| AU-32 | ¿Hay SUS al inicio y al cierre, y hallazgos de accesibilidad atendidos? | Hojas del Anexo G; `hallazgo-usabilidad.yml` | | |
| AU-33 | ¿Cada cambio llegó al piloto por la etapa 8, con su acta? | Corridas de `staging.yml`; actas de promoción y liberación | | |
| AU-34 | ¿Hubo una restauración de prueba por periodo, con RPO menor a 24 h y RTO menor a 4 h? | Actas en `docs/evidencias/ensayos/`; `inventario.csv` | | |
| AU-35 | ¿Las alertas llegaron a DevOps y al PO, y se atendieron? | Historial de Alertmanager; incidentes | | |
| AU-21 y Tabla 10 | ¿Hubo controles paralelos del expediente? | Entrevista por rol; muestra contra el archivo físico | | |
| AU-24 | ¿La conciliación diaria corrió todos los días hábiles, y cada diferencia se explicó? | Historial de CD-DAT-03 | | |
| AU-36 | ¿Cada incidente tiene severidad, contención, comunicación y cierre por otra persona? ¿Los recurrentes tienen causa raíz? | Issues `incidente` y `defecto`; `respuesta-a-incidentes.md`, apartado 6 | | |
| Sección 37 | ¿Los mantenimientos se anunciaron con 48 h y las emergencias se documentaron en 24 h? | Avisos; issues `cambio` de tipo Emergencia | | |
| AU-40 | ¿Las NC del semestre tienen causa, acción y verificación de eficacia? | `registro-no-conformidades.md` | | |
| AU-39 | ¿QA publicó el informe de cierre antes de que el PO decidiera? | Fechas del informe y del acta de la fase 5 | | |

## 4. Registro de hallazgos

| ID | Tipo | Criterio | Evidencia | Descripción | NC trasladada |
|---|---|---|---|---|---|
| | | | | | |

## 5. Dictamen y seguimiento

- **Conclusión y dictamen:**
- **Plan de seguimiento:**

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Auditor | | | |
| Product Owner | | | |
