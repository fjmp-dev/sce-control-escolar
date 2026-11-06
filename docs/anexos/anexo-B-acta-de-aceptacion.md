# Anexo B. Plantilla de acta de aceptación de fase o de release

**Fuente:** SCE-MC-001 v2.0, secciones 10 y 43.2. Copiar a `docs/gobierno/actas/` y llenar.

**Acta número:** ACT-`<fase o release>`-`<consecutivo>`
**Objeto:** fase `<n>` · release `vX.Y.Z`
**Fecha real de la decisión:** `<no se antedata>`
**Etiqueta o commit:** `<...>`
**Participantes:** `<nombres y rol>`

---

## 1. Condición mínima de la Tabla 23

Copiar textual la condición de la fase. Es lo primero que se evalúa.

| Fase | Condición mínima (Tabla 23) |
|---|---|
| 0 | Acta de levantamiento con control escolar, coordinación y caja, y lista explícita de qué entra y qué no |
| 1 | Catálogos de facultades, periodos, planes, materias y usuarios; autenticación de los seis roles |
| 2 | Expediente único, inscripción por semestre con requisitos y adeudos, y portales básicos |
| 3 | Horarios con detección de choques, captura y consulta de calificaciones e historial actualizable |
| 4 | Estado de cuenta, pago reflejado, constancias con estado y bitácora de operaciones sensibles |
| 5 | Uso real durante un semestre, informe de indicadores y dictamen de aceptación |

| Condición evaluada | Resultado | Evidencia |
|---|---|---|
| | Cumple / No cumple | |

## 2. Condiciones generales (sección 10.1)

| Condición | Resultado | Evidencia |
|---|---|---|
| Todo requisito Must del incremento tiene al menos un caso con resultado satisfactorio | | |
| No existen defectos críticos abiertos | | |
| La bitácora registra cambios de calificación, pago y emisión de constancia en el alcance del incremento | | |
| El incremento es desplegable en pruebas o staging, y su promoción a piloto cumple la sección 20, con rollback documentado | | |
| El alcance no incluye funcionalidades fuera de la primera versión, salvo cambio aprobado | | |

## 3. Resultados de pruebas (sección 10.4)

| Caso | Requisito | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| | | | | |

## 4. Subcaracterísticas de prioridad Alta cubiertas (sección 8.4)

| Subcaracterística | Casos de aceptación | Resultado |
|---|---|---|
| | | |

## 5. Defectos abiertos, si la aceptación es condicionada

La aceptación condicionada nunca aplica a requisitos Must críticos (sección 10.4).

| Defecto | Severidad | Plan y fecha |
|---|---|---|
| | | |

## 6. Riesgos

Riesgos de nivel Alto mitigados o aceptados por escrito con plan fechado. Enlace a la matriz revisada: `<...>`.

## 7. Línea base (sección 15.3)

Etiqueta, requisitos Must cubiertos, migraciones aplicadas, configuración usada en la demostración y enlace a las notas de versión.

## 8. Decisión

**Aceptada · Aceptada con condiciones · Rechazada.** Observaciones: `<...>`

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner (rinde cuentas de la aceptación) | | | |
| QA (declara si la evidencia es suficiente) | | | |
| Autor del entregable (no decide) | | | |
